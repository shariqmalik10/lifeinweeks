/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import {
  CubicBezier2d,
  Editor,
  IndexKey,
  Mat,
  RecordProps,
  SVGContainer,
  ShapeUtil,
  TLBaseShape,
  TLHandle,
  TLHandleDragInfo,
  Vec,
  VecLike,
  VecModel,
  createShapeId,
  useEditor,
  useValue,
  vecModelValidator,
} from 'tldraw'
import { PORT_RADIUS_PX } from '../constants'
import { getNodePorts } from '../nodes/nodePorts'
import { getPortAtPoint } from '../ports/getPortAtPoint'
import { updatePortState } from '../ports/portState'
import {
  createOrUpdateConnectionBinding,
  getConnectionBindingPositionInPageSpace,
  getConnectionBindings,
  removeConnectionBinding,
} from './ConnectionBindingUtil'

/**
 * A connection shape is a directed connection between two node shapes. It has a start point, and an
 * end point. These are called "terminals" in the code.
 *
 * Usually, a connection will also have two ConnectionBindings. These bind each end of the shape to
 * the nodes it's connected to. The `start` and `end` properties are the positions of each end of
 * the connection, but only when there isn't a binding (ie while dragging the connection). When the
 * ends are bound, the position is derived from the connected shape instead.
 */
export type ConnectionShape = TLBaseShape<
  'connection',
  {
    start: VecModel
    end: VecModel
  }
>

export class ConnectionShapeUtil extends ShapeUtil<ConnectionShape> {
  static override type = 'connection' as const
  static override props: RecordProps<ConnectionShape> = {
    start: vecModelValidator,
    end: vecModelValidator,
  }

  getDefaultProps(): ConnectionShape['props'] {
    return {
      start: { x: 0, y: 0 },
      end: { x: 100, y: 100 },
    }
  }

  override canEdit() {
    return false
  }
  override canResize() {
    return false
  }
  override hideResizeHandles() {
    return true
  }
  override hideRotateHandle() {
    return true
  }
  override hideSelectionBoundsBg() {
    return true
  }
  override hideSelectionBoundsFg() {
    return true
  }
  override canSnap() {
    // disable snapping this shape to other shapes
    return false
  }
  override getBoundsSnapGeometry() {
    return {
      // disable snapping other shape to this shape
      points: [],
    }
  }

  // Define the geometry of our connection shape as a cubic bezier curve
  getGeometry(connection: ConnectionShape) {
    const { start, end } = getConnectionTerminals(this.editor, connection)
    const [cp1, cp2] = getConnectionControlPoints(start, end, 'vertical')
    return new CubicBezier2d({
      start: Vec.From(start),
      cp1: Vec.From(cp1),
      cp2: Vec.From(cp2),
      end: Vec.From(end),
    })
  }

  getHandles(connection: ConnectionShape): TLHandle[] {
    // Handles are draggable points on a shape. In our connection shape, we have a handle at each end.
    const { start, end } = getConnectionTerminals(this.editor, connection)
    return [
      {
        id: 'start',
        type: 'vertex',
        index: 'a0' as IndexKey,
        x: start.x,
        y: start.y,
      },
      {
        id: 'end',
        type: 'vertex',
        index: 'a1' as IndexKey,
        x: end.x,
        y: end.y,
      },
    ]
  }

  // Handle dragging of connection terminals to connect/disconnect from ports
  onHandleDrag(connection: ConnectionShape, { handle }: TLHandleDragInfo<ConnectionShape>) {
    // First, get some info about the connection and the terminal we're dragging
    const existingBindings = getConnectionBindings(this.editor, connection)
    const draggingTerminal = handle.id as 'start' | 'end'
    const oppositeTerminal = draggingTerminal === 'start' ? 'end' : 'start'
    const oppositeTerminalShapeId = existingBindings[oppositeTerminal]?.toId

    // Find the new position of the handle in page space
    const shapeTransform = this.editor.getShapePageTransform(connection)
    const handlePagePosition = shapeTransform.applyToPoint(handle)

    // Find the port at the new position
    const target = getPortAtPoint(this.editor, handlePagePosition, {
      margin: 8,
      terminal: handle.id as 'start' | 'end',
    })

    // Update the port UI state to show eligible ports and hint at the target port
    updatePortState(this.editor, {
      hintingPort: target ? { shapeId: target.shape.id, portId: target.port.id } : null,
      eligiblePorts: {
        terminal: draggingTerminal,
        excludeNodes: oppositeTerminalShapeId ? new Set([oppositeTerminalShapeId]) : null,
      },
    })

    // If we found a port, connect to it. Otherwise, just update the position.
    if (target) {
      createOrUpdateConnectionBinding(this.editor, connection, target.shape, {
        portId: target.port.id,
        terminal: draggingTerminal,
      })
    } else {
      removeConnectionBinding(this.editor, connection, draggingTerminal)
      const inverseShapeTransform = Mat.Inverse(shapeTransform)
      const handleShapePosition = Mat.applyToPoint(inverseShapeTransform, handlePagePosition)
      return {
        ...connection,
        props: {
          ...connection.props,
          [draggingTerminal]: handleShapePosition,
        },
      }
    }

    return connection
  }

  // Handle the end of dragging a connection terminal
  onHandleDragEnd(
    connection: ConnectionShape,
    { handle, isCreatingShape }: TLHandleDragInfo<ConnectionShape>
  ) {
    // clear our port UI state
    updatePortState(this.editor, { hintingPort: null, eligiblePorts: null })

    const draggingTerminal = handle.id as 'start' | 'end'

    // if we successfully connected & now have a binding, we're done!
    const bindings = getConnectionBindings(this.editor, connection)
    if (bindings[draggingTerminal]) {
      return
    }

    // If we were creating a new connection and didn't attach it to anything, open the component
    // picker to let the user choose a node to create.
    if (isCreatingShape && draggingTerminal === 'end') {
      this.editor.selectNone()
      const newNodeId = createShapeId()
      const terminalInPageSpace = this.editor.inputs.currentPagePoint
      this.editor.createShape({
        type: 'node',
        id: newNodeId,
        x: terminalInPageSpace.x,
        y: terminalInPageSpace.y,
        props: {
          node: { type: 'message', role: 'assistant', text: '' },
        },
      })
      this.editor.select(newNodeId)

      // Position the node so its input port aligns with the connection end
      const ports = getNodePorts(this.editor, newNodeId)
      const firstInputPort = Object.values(ports).find((p) => p.terminal === 'end')
      if (firstInputPort) {
        this.editor.updateShape({
          id: newNodeId,
          type: 'node',
          x: terminalInPageSpace.x - firstInputPort.x,
          y: terminalInPageSpace.y - firstInputPort.y,
        })

        // bind the connection to the node's first input port
        createOrUpdateConnectionBinding(this.editor, connection, newNodeId, {
          portId: firstInputPort.id,
          terminal: draggingTerminal,
        })
      }
    } else {
      // if we're not creating a new connection and we just let go, there must be bindings. If
      // not, let's interpret this as the user disconnecting the shape.
      if (!bindings.start || !bindings.end) {
        this.editor.deleteShapes([connection.id])
      }
    }
  }

  onHandleDragCancel() {
    // if we cancel a drag part way through, we need to clear out our port UI state.
    updatePortState(this.editor, { hintingPort: null, eligiblePorts: null })
  }

  component(shape: ConnectionShape) {
    return <ConnectionShapeComponent shape={shape} />
  }

  indicator(shape: ConnectionShape) {
    const editor = useEditor()
    const { start, end } = getConnectionTerminals(editor, shape)
    const [cp1, cp2] = getConnectionControlPoints(start, end, 'vertical')
    const path = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`
    return <path d={path} className="ConnectionShapeIndicator" />
  }
}

function ConnectionShapeComponent({ shape }: { shape: ConnectionShape }) {
  const editor = useEditor()
  const { start, end } = useValue(
    'connection terminals',
    () => getConnectionTerminals(editor, shape),
    [editor, shape]
  )
  const [cp1, cp2] = getConnectionControlPoints(start, end, 'vertical')
  const path = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`

  return (
    <SVGContainer>
      <path d={path} className="ConnectionShape" />
    </SVGContainer>
  )
}

/**
 * Get the start and end positions of a connection in shape space. If the connection has bindings,
 * we use the binding positions. Otherwise, we use the connection's own start and end properties.
 */
function getConnectionTerminals(editor: Editor, connection: ConnectionShape) {
  const bindings = getConnectionBindings(editor, connection)
  const shapeTransform = editor.getShapePageTransform(connection)
  const inverseShapeTransform = Mat.Inverse(shapeTransform)

  let start = connection.props.start
  if (bindings.start) {
    const startInPageSpace = getConnectionBindingPositionInPageSpace(editor, bindings.start)
    if (startInPageSpace) {
      start = Mat.applyToPoint(inverseShapeTransform, startInPageSpace)
    }
  }

  let end = connection.props.end
  if (bindings.end) {
    const endInPageSpace = getConnectionBindingPositionInPageSpace(editor, bindings.end)
    if (endInPageSpace) {
      end = Mat.applyToPoint(inverseShapeTransform, endInPageSpace)
    }
  }

  return { start, end }
}

/**
 * Get the control points for a cubic bezier curve between two points.
 */
function getConnectionControlPoints(
  start: VecLike,
  end: VecLike,
  direction: 'horizontal' | 'vertical'
): [VecLike, VecLike] {
  const distance = Vec.Dist(start, end)
  const bendAmount = Math.min(distance / 2, 100)

  if (direction === 'horizontal') {
    return [
      { x: start.x + bendAmount, y: start.y },
      { x: end.x - bendAmount, y: end.y },
    ]
  } else {
    return [
      { x: start.x, y: start.y + bendAmount },
      { x: end.x, y: end.y - bendAmount },
    ]
  }
}
