'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCompletion } from '@ai-sdk/react'
import { HTMLContainer, Rectangle2d, ShapeUtil, TLBaseShape, toDomPrecision, useEditor } from 'tldraw'
import { MessageNodeView } from './MessageNodeView'

// 1) Define the shape's props (this is your node's data model)
export type MessageRole = 'user' | 'assistant'

export type MessageNodeShape = TLBaseShape<
  'message-node',
  {
    role: MessageRole
    text: string
    w: number
    h: number
  }
>

// 2) Shape util: how to render and interact with the shape
export class MessageNodeUtil extends ShapeUtil<MessageNodeShape> {
  [x: string]: any
  static type = 'message-node' as const

  getDefaultProps(): MessageNodeShape['props'] {
    return {
      role: 'assistant',
      text: '',
      w: 420,
      h: 200,
    }
  }

  // Bounds used by selection box and hit testing
  getGeometry(shape: MessageNodeShape) {
    const { w, h } = shape.props
    // Keep the visible card at 50% of the shape's width so selection matches UI
    const widthScale = 0.5
    return new Rectangle2d({ width: w * widthScale, height: h, isFilled: true })
  }

  indicator(shape: MessageNodeShape) {
    const { w, h } = shape.props
    const widthScale = 0.5
    return <rect rx={12} width={toDomPrecision(w * widthScale)} height={toDomPrecision(h)} />
  }

  // The React component that renders inside the canvas
  component(shape: MessageNodeShape) {
    const { w, h, role, text } = shape.props
    const border = role === 'user' ? '#7c3aed' : '#2563eb'
    const editor = useEditor()

    // Local input and streaming state for this node
    const [input, setInput] = useState('')
    const { complete, completion, isLoading } = useCompletion({ api: '/api/prompt' })

    // Auto-size calculation mirrors our helper but local to avoid circular deps
    const computeAutoHeight = useMemo(() => {
      return (value: string) => {
        const approxCharsPerLine = 60
        const lineHeight = 20
        const padding = 24
        const lines = Math.ceil(Math.max(1, value.length) / approxCharsPerLine)
        return Math.max(h, padding + lines * lineHeight)
      }
    }, [h])

    // Stream chunks into this node's text
    useEffect(() => {
      if (!completion) return
      const newHeight = computeAutoHeight(completion)
      try {
        editor.updateShape<MessageNodeShape>({
          id: shape.id,
          type: 'message-node',
          props: { text: completion, h: newHeight },
        })
      } catch (err) {
        console.error('Failed to update node during streaming', err)
      }
    }, [completion, computeAutoHeight, editor, shape.id])

    const widthScale = 0.5
    const effectiveWidth = w * widthScale

    return (
      <HTMLContainer style={{ width: toDomPrecision(effectiveWidth), height: toDomPrecision(h) }}>
        <MessageNodeView
          role={role}
          text={text}
          input={input}
          setInput={setInput}
          onSubmit={() => {
            if (!input || isLoading) return
            complete(input)
            setInput('')
          }}
          isLoading={isLoading}
          widthPercent={100}
        />
      </HTMLContainer>
    )
  }
}


