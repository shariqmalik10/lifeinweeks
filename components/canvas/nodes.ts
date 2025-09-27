import { Editor, TLArrowShape, TLShapeId, createShapeId } from 'tldraw'
import { MessageNodeShape } from './shapes/MessageNode'

export type MessageRole = 'user' | 'assistant'

export interface CreateMessageNodeOptions {
  role?: MessageRole
  text?: string
  x?: number
  y?: number
  width?: number
  height?: number
}

export function createMessageNode(editor: Editor, options: CreateMessageNodeOptions = {}): TLShapeId {
  const role = options.role ?? 'assistant'
  const text = options.text ?? ''

  const point = {
    x: options.x ?? editor.inputs.currentPagePoint?.x ?? editor.getViewportScreenCenter().x,
    y: options.y ?? editor.inputs.currentPagePoint?.y ?? editor.getViewportScreenCenter().y,
  }

  const width = options.width ?? 420
  const height = options.height ?? 140

  const id = createShapeId()

  editor.createShapes<MessageNodeShape>([
    {
      id,
      type: 'message-node',
      x: point.x,
      y: point.y,
      props: {
        role,
        text,
        w: width,
        h: height,
      },
    },
  ])

  return id
}

export function updateMessageNodeText(editor: Editor, id: TLShapeId, text: string, minHeight = 140) {
  try {
    const approxCharsPerLine = 60
    const lineHeight = 20
    const padding = 24
    const lines = Math.ceil(Math.max(1, text.length) / approxCharsPerLine)
    const autoHeight = Math.max(minHeight, padding + lines * lineHeight)

    editor.updateShape<MessageNodeShape>({
      id,
      type: 'message-node',
      props: {
        h: autoHeight,
        text,
      },
    })
  } catch (error) {
    console.error('Failed to update message node text', error)
  }
}

export function linkNodes(editor: Editor, fromId: TLShapeId, toId: TLShapeId) {
  const fromShape = editor.getShape<MessageNodeShape>(fromId)
  const toShape = editor.getShape<MessageNodeShape>(toId)
  if (!fromShape || !toShape) return

  const fromCenter = {
    x: fromShape.x + (fromShape.props.w ?? 0) / 2,
    y: fromShape.y + (fromShape.props.h ?? 0) / 2,
  }
  const toCenter = {
    x: toShape.x + (toShape.props.w ?? 0) / 2,
    y: toShape.y + (toShape.props.h ?? 0) / 2,
  }

  const arrowId = createShapeId()

  editor.createShapes<TLArrowShape>([
    {
      id: arrowId,
      type: 'arrow',
      x: Math.min(fromCenter.x, toCenter.x),
      y: Math.min(fromCenter.y, toCenter.y),
      props: {
        dash: 'draw',
        size: 'm',
        bend: 0,
        start: {
          x: fromCenter.x,
          y: fromCenter.y,
        },
        end: {
          x: toCenter.x,
          y: toCenter.y,
        },
      },
    },
  ])

  return arrowId
}


