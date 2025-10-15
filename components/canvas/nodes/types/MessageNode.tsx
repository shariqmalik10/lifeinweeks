'use client'

import { useCallback, useState } from 'react'
import { Editor, T, useEditor } from 'tldraw'
import { NODE_HEIGHT_PX, NODE_WIDTH_PX } from '../../constants'
import { getConnectedSubgraph, serializeSubgraph } from '../helpers'
// If '../NodeShapeUtil' does not exist or is misplaced, please ensure this file and its types are present.
// If not present, temporarily comment out or remove the import below to fix error.
import type { NodeShape } from '../NodeShapeUtil'
import {
  NodeComponentProps,
  NodeDefinition,
  shapeInputPort,
  shapeOutputPort,
  updateNode,
} from './shared'

/**
 * This node is a message with user input and assistant response.
 */
export type MessageNode = T.TypeOf<typeof MessageNode>
export const MessageNode = T.object({
  type: T.literal('message'),
  role: T.literalEnum('user', 'assistant'),
  text: T.string,
})

export class MessageNodeDefinition extends NodeDefinition<MessageNode> {
  static type = 'message'
  static validator = MessageNode
  title = 'Message'
  heading = 'Message'
  icon = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2h12v9H4.5L2 13.5V2z" />
    </svg>
  )

  getDefault(): MessageNode {
    return {
      type: 'message',
      role: 'assistant',
      text: '',
    }
  }

  getBodyWidthPx(_shape: NodeShape, _node: MessageNode): number {
    return NODE_WIDTH_PX
  }

  getBodyHeightPx(_shape: NodeShape, node: MessageNode): number {
    const text = node.text.trim()
    if (text === '' || text === '...') return NODE_HEIGHT_PX

    // Measure text height dynamically
    const size = this.editor.textMeasure.measureText(text, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 14,
      fontWeight: '400',
      fontStyle: 'normal',
      maxWidth: NODE_WIDTH_PX - 72, // account for padding (24px container + 24px text area)
      lineHeight: 1.5,
      padding: '12px',
    })
    
    // Calculate total height: header (40px) + text area padding (24px) + text height + input area (60px) + margins
    const totalHeight = 40 + 24 + size.h + 60 + 12
    return Math.max(NODE_HEIGHT_PX, Math.min(totalHeight, 600)) // cap at 600px max
  }

  getPorts(shape: NodeShape, node: MessageNode) {
    return {
      input: shapeInputPort,
      output: {
        ...shapeOutputPort,
        y: this.getBodyHeightPx(shape, node),
      },
    }
  }

  Component = MessageNodeComponent
}

function buildCanvasContext(editor: Editor) {
  const shapes = editor.getCurrentPageShapes()
  const messageNodes: Array<{ id: string; role: 'user' | 'assistant'; text: string }> = []
  const textShapes: Array<{ id: string; type: string; text: string }> = []

  for (const shape of shapes) {
    // Our custom message nodes
    if (editor.isShapeOfType<any>(shape, 'node')) {
      const node = (shape as any).props?.node
      if (node?.type === 'message') {
        messageNodes.push({ id: shape.id, role: node.role, text: node.text ?? '' })
        continue
      }
    }

    // TLDraw text-like shapes (best-effort)
    const anyShape = shape as any
    if ((anyShape.type === 'text' || anyShape.type === 'note') && anyShape.props?.text) {
      textShapes.push({ id: shape.id, type: anyShape.type, text: String(anyShape.props.text) })
    }
  }

  return { messageNodes, textShapes }
}

function stringifyCanvasContext(context: ReturnType<typeof buildCanvasContext>, maxChars = 8000) {
  const json = JSON.stringify(context)
  return json.length > maxChars ? json.slice(0, maxChars) + '…' : json
}

function MessageNodeComponent({ node, shape }: NodeComponentProps<MessageNode>) {
  const editor = useEditor()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return

      setIsLoading(true)

      try {
        // Update node with loading state
        updateNode<MessageNode>(editor, shape, (node) => ({
          ...node,
          text: '...',
        }))

        // Subgraph context (connected component of this node)
        const subgraph = getConnectedSubgraph(editor, shape.id)
        const contextString = serializeSubgraph(subgraph, 16000)

        const promptWithContext = `You are operating inside an infinite canvas. You have awareness of the current node's connected subgraph (JSON below). Use this context to answer succinctly.\n\nSubgraphContext: ${contextString}\n\nUserPrompt: ${input}`

        // Call your API endpoint with context-augmented prompt
        const response = await fetch('/api/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptWithContext }),
        })

        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulatedText = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          
          // Parse Vercel AI SDK streaming format (SSE with data: prefix)
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue
              
              try {
                const parsed = JSON.parse(data)
                // Vercel AI SDK format: { type: "text-delta", delta: "text" }
                if (parsed.type === 'text-delta' && parsed.delta) {
                  accumulatedText += parsed.delta
                }
              } catch (e) {
                // Ignore parse errors for malformed chunks
                console.debug('Failed to parse chunk:', data)
              }
            }
          }

          // Update node with streaming text (only if we have content)
          if (accumulatedText) {
            updateNode<MessageNode>(editor, shape, (node) => ({
              ...node,
              text: accumulatedText,
            }))
          }
        }

        setInput('')
      } catch (error) {
        console.error('Streaming error:', error)
        updateNode<MessageNode>(editor, shape, (node) => ({
          ...node,
          text: 'Error: Failed to get response',
        }))
      } finally {
        setIsLoading(false)
      }
    },
    [editor, shape, input, isLoading]
  )

  const borderClass = node.role === 'user' ? 'border-purple-600' : 'border-blue-600'

  return (
    <div
      className={`box-border flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-lg ${borderClass}`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="inline-flex items-center gap-2 border-b border-slate-200 px-3 py-2 text-xs text-slate-500">
        {node.role}
      </div>
      <div className="flex-1 overflow-auto p-3">
        <div className="min-h-[120px] whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed">
          {node.text || ' '}
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="box-border grid grid-cols-[1fr_auto] items-center gap-2 border-t border-slate-200 p-3"
        onPointerDown={(e) => {
          // Prevent TLDraw from capturing pointer when interacting with inputs
          e.stopPropagation()
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onPointerDown={(e) => e.stopPropagation()}
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={isLoading}
          className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
