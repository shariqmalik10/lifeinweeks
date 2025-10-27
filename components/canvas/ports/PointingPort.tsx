import { createShapeId, StateNode, TLPointerEventInfo, TLShapeId } from 'tldraw'
import { createOrUpdateConnectionBinding } from '../connection/ConnectionBindingUtil'
import { ConnectionShape } from '../connection/ConnectionShapeUtil'
import { getNodePortConnections, getNodePorts } from '../nodes/nodePorts'
import { PORT_RADIUS_PX } from '../constants'

export interface PointingPortInfo {
  shapeId: TLShapeId
  portId: string
  terminal: 'start' | 'end'
}

export class PointingPort extends StateNode {
  static override id = 'pointing_port'
  info?: PointingPortInfo

  override onEnter(info: PointingPortInfo): void {
    this.info = info
  }

  override onPointerMove(info: TLPointerEventInfo): void {
    if (!this.info) return
    if (!this.editor.inputs.isDragging) return

    const allowsMultiple = this.info.terminal === 'start'
    const existing = getNodePortConnections(this.editor, this.info.shapeId).find(
      (c) => c.ownPortId === this.info!.portId
    )
    if (!allowsMultiple && existing) {
      // If already connected and terminal cannot fan-out, drag the existing connection instead
      const handle = this.editor
        .getShapeHandles(existing.connectionId)
        ?.find((h) => h.id === this.info!.terminal)
      if (handle) {
        this.parent.transition('dragging_handle', {
          ...info,
          target: 'handle',
          shape: this.editor.getShape(existing.connectionId)!,
          handle,
        })
      }
      return
    }

    // Create a new connection and start dragging its opposite terminal
    const connectionId = createShapeId()
    const connectingTerminal = this.info.terminal
    const draggingTerminal = connectingTerminal === 'start' ? 'end' : 'start'

    this.editor.createShape<ConnectionShape>({
      id: connectionId,
      type: 'connection',
      x: this.editor.inputs.currentPagePoint.x,
      y: this.editor.inputs.currentPagePoint.y,
      props: { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
    })

    createOrUpdateConnectionBinding(this.editor, connectionId, this.info.shapeId, {
      portId: this.info.portId,
      terminal: connectingTerminal,
    })

    const handle = this.editor.getShapeHandles(connectionId)?.find((h) => h.id === draggingTerminal)
    if (handle) {
      this.parent.transition('dragging_handle', {
        ...info,
        target: 'handle',
        shape: this.editor.getShape(connectionId)!,
        handle,
        isCreating: true,
      })
    }
  }

  override onPointerUp(info: TLPointerEventInfo): void {
    // treat as click; no-op, then return to idle
    this.parent.transition('idle', info)
  }
}


