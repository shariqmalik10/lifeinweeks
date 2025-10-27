
'use client'

import { useCallback, useRef, useState } from 'react'
import { Editor, T, useEditor } from 'tldraw'
import { NODE_HEIGHT_PX, NODE_WIDTH_PX } from '../../constants'
import { getConnectedSubgraph, serializeSubgraph } from '../helpers'
import { createMessageNode, connectNodes, layoutSpawnBelow, layoutSpawnRight, frameShapes } from '../helpers'
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
  autoSplit: T.boolean,
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
      autoSplit: false,
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
  const [isSpawning, setIsSpawning] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)

  // --- helpers for immediate planning / splitting ---
  function tryParseStepsFromSSEBuffer(buffer: string): string[] {
    const lines = buffer.split('\n').filter((l) => l.startsWith('data:'))
    // try newest-first for JSON array embedded in text-delta
    for (let i = lines.length - 1; i >= 0; i--) {
      const data = lines[i].slice(6).trim()
      try {
        const obj = JSON.parse(data)
        if (obj?.type === 'text-delta' && typeof obj.delta === 'string') {
          const j = JSON.parse(obj.delta)
          if (Array.isArray(j)) return j
        }
      } catch {}
      try {
        const j = JSON.parse(data)
        if (Array.isArray(j)) return j
      } catch {}
    }
    return []
  }

  async function enrichChildNode(childId: string, stepText: string) {
    try {
      // Set a brief placeholder while enriching
      editor.updateShape({ id: childId as any, type: 'node', props: { node: { type: 'message', role: 'assistant', text: 'Preparing brief…', autoSplit: false } } })

      const subgraph = getConnectedSubgraph(editor, shape.id)
      const ctx = serializeSubgraph(subgraph, 10000)
      const enrichPrompt = `Write a concise markdown brief using this exact template. Keep to ~120–200 words, add 2–3 tasks and 2–3 credible resources with valid markdown links.\n\nTemplate: \n# {Title}\n\n## Summary\n...\n\n## Tasks\n- ...\n- ...\n\n## Resources\n- [Label](URL) — short reason\n- [Label](URL) — short reason\n\nContent to enrich: \"${stepText}\"\nContext: ${ctx}`

      const res = await fetch('/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: enrichPrompt }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      if (reader) {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (!line.startsWith('data:')) continue
            const data = line.slice(6).trim()
            if (!data || data === '[DONE]') continue
            try {
              const obj = JSON.parse(data)
              if (obj?.type === 'text-delta' && typeof obj.delta === 'string') {
                accumulated += obj.delta
              }
            } catch {}
          }
          if (accumulated) {
            editor.updateShape({ id: childId as any, type: 'node', props: { node: { type: 'message', role: 'assistant', text: accumulated, autoSplit: false } } })
          }
        }
      }
    } catch (e) {
      console.warn('enrich failed', e)
    }
  }

  async function spawnStepsStreaming(basePrompt: string) {
    if (isSpawning) return
    setIsSpawning(true)
    try {
      updateNode<MessageNode>(editor, shape, (n) => ({ ...n, text: 'Planning…', autoSplit: true }))

      const subgraph = getConnectedSubgraph(editor, shape.id)
      const ctx = serializeSubgraph(subgraph, 10000)
      const planningPrompt = `Stream actionable steps, ONE PER LINE, prefixed with "- ", no numbering or extra prose. Do not include any content other than lines. Stop when done.\n\nTask: "${basePrompt}"\nContext: ${ctx}`
      const res = await fetch('/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: planningPrompt }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let emitted = 0
      if (reader) {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          // accumulate plain text from SSE
          const lines = buffer
            .split('\n')
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(6))
          let plain = ''
          for (const data of lines) {
            try {
              const o = JSON.parse(data)
              if (o?.type === 'text-delta' && typeof o.delta === 'string') plain += o.delta
            } catch {}
          }
          const bullets = plain.split(/\r?\n/).filter((l) => /^\s*[-•*]\s+/.test(l))
          while (emitted < bullets.length) {
            const text = bullets[emitted].replace(/^\s*[-•*]\s+/, '').trim()
            if (text) {
              const pos = layoutSpawnBelow(editor, shape.id, emitted + 1)[emitted]
              const id = createMessageNode(editor, { x: pos.x, y: pos.y, role: 'assistant', text })
              connectNodes(editor, shape.id, id)
              frameShapes(editor, [shape.id, id])
              // enrich in parallel
              enrichChildNode(id as any, text)
            }
            emitted++
          }
        }
      }
    } catch (e) {
      console.warn('planning stream failed', e)
    } finally {
      setIsSpawning(false)
    }
  }

  function parseStepsHeuristic(source: string): string[] {
    const lines = source.split(/\r?\n/)
    const steps: string[] = []
    for (const raw of lines) {
      const line = raw.trim()
      const m = line.match(/^(?:[-•*]|\d+[.)]|step\s*\d+[:.)-])\s+(.+)/i)
      if (m && m[1]) steps.push(m[1].trim())
    }
    return steps
  }

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

        // Do not render assistant text on parent; kick off planning stream instead
        spawnStepsStreaming(input)

        setInput('')

        // Auto-split (legacy fallback)
        const finalText = (editor.getShape(shape.id) as any)?.props?.node?.text ?? ''
        const nodeNow = editor.getShape(shape.id) as any
        const alreadySplit = !!nodeNow?.props?.node?.autoSplit
        if (!alreadySplit && (node.role === 'assistant' || true)) {
          let steps = parseStepsHeuristic(finalText)
          if (steps.length < 2) {
            try {
              const subgraph = getConnectedSubgraph(editor, shape.id)
              const ctx = serializeSubgraph(subgraph, 8000)
              const extractionPrompt = `Extract actionable steps from the following content and return ONLY a JSON array of strings (no prose). If there are no clear steps, return [].\n\nContent:\n${finalText}\n\nContext:${ctx}`
              const exRes = await fetch('/api/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: extractionPrompt }),
              })
              const exText = await exRes.text()
              const exLines = exText.split('\n').filter((l) => l.startsWith('data:'))
              for (const line of exLines.reverse()) {
                const data = line.slice(6).trim()
                try {
                  const obj = JSON.parse(data)
                  if (obj.type === 'text-delta' && typeof obj.delta === 'string') {
                    const maybe = JSON.parse(obj.delta)
                    if (Array.isArray(maybe)) { steps = maybe; break }
                  }
                } catch {}
                try {
                  const maybe = JSON.parse(data)
                  if (Array.isArray(maybe)) { steps = maybe; break }
                } catch {}
              }
            } catch {}
          }
          steps = (steps || []).map((s) => String(s).trim()).filter(Boolean).slice(0, 7)
          if (steps.length >= 2) {
            const positions = layoutSpawnBelow(editor, shape.id, steps.length)
            const ids = steps.map((t, i) => createMessageNode(editor, { x: positions[i].x, y: positions[i].y, role: 'assistant', text: t }))
            for (const id of ids) connectNodes(editor, shape.id, id)
            updateNode<MessageNode>(editor, shape, (n) => ({ ...n, autoSplit: true }))
          }
        }
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
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Expand to branch"
            disabled={isLoading || isExpanding || !node.text?.trim()}
            className="rounded-xl bg-slate-200 px-3 py-2 text-xs text-slate-700 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={async () => {
              if (isLoading || isExpanding) return
              const base = node.text?.trim()
              if (!base) return
              setIsExpanding(true)
              try {
                // Build subgraph context
                const subgraph = getConnectedSubgraph(editor, shape.id)
                const ctx = serializeSubgraph(subgraph, 12000)
                const expandPrompt = `Return ONLY a JSON array of 3-7 sub-steps that further break down: "${base}". No prose. Context: ${ctx}`
                const res = await fetch('/api/prompt', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: expandPrompt }),
                })
                const reader = res.body?.getReader()
                const decoder = new TextDecoder()
                let buffer = ''
                if (reader) {
                  while (true) {
                    const { value, done } = await reader.read()
                    if (done) break
                    buffer += decoder.decode(value, { stream: true })
                  }
                }
                // Extract JSON from the SSE stream
                const lines = buffer.split('\n').filter((l) => l.startsWith('data:'))
                let steps: string[] = []
                for (const line of lines) {
                  const data = line.slice(6).trim()
                  try {
                    const obj = JSON.parse(data)
                    if (obj.type === 'text-delta' && typeof obj.delta === 'string') {
                      steps = JSON.parse(obj.delta)
                      break
                    }
                  } catch {}
                }
                if (!steps.length) {
                  const last = lines.at(-1)?.slice(6).trim() ?? ''
                  try { steps = JSON.parse(last) } catch {}
                }
                if (!steps.length) {
                  const bullets = base.match(/^\s*(?:[-•*]|\d+[.)])\s+(.+)$/gmi) ?? []
                  steps = bullets.map((b) => b.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, '').trim()).filter(Boolean)
                }
                steps = steps.filter((s) => typeof s === 'string' && s.trim()).slice(0, 7)
                if (!steps.length) return

                // Layout and create to the right
                const positions = layoutSpawnRight(editor, shape.id, steps.length)
                const childIds = steps.map((text, i) =>
                  createMessageNode(editor, { x: positions[i].x, y: positions[i].y, role: 'assistant', text })
                )
                for (const id of childIds) connectNodes(editor, shape.id, id)
                frameShapes(editor, [shape.id, ...childIds])
              } finally {
                setIsExpanding(false)
              }
            }}
          >
            {isExpanding ? '...' : 'Expand'}
          </button>
          <button
            type="button"
            aria-label="Split into steps"
            disabled={isLoading || isSpawning || !node.text?.trim()}
            className="rounded-xl bg-slate-200 px-3 py-2 text-xs text-slate-700 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={async () => {
              if (isLoading || isSpawning) return
              const base = node.text?.trim()
              if (!base) return
              setIsSpawning(true)
              try {
                // Build subgraph context
                const subgraph = getConnectedSubgraph(editor, shape.id)
                const ctx = serializeSubgraph(subgraph, 12000)
                const splitPrompt = `Return ONLY a JSON array of 3-7 concise steps for: "${base}". No prose. Context: ${ctx}`
                const res = await fetch('/api/prompt', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: splitPrompt }),
                })
                const reader = res.body?.getReader()
                const decoder = new TextDecoder()
                let buffer = ''
                if (reader) {
                  while (true) {
                    const { value, done } = await reader.read()
                    if (done) break
                    buffer += decoder.decode(value, { stream: true })
                  }
                }
                // Extract JSON from the SSE stream
                const lines = buffer.split('\n').filter((l) => l.startsWith('data:'))
                let steps: string[] = []
                for (const line of lines) {
                  const data = line.slice(6).trim()
                  try {
                    const obj = JSON.parse(data)
                    if (obj.type === 'text-delta' && typeof obj.delta === 'string') {
                      // try to accumulate until we get valid JSON array
                      steps = JSON.parse(obj.delta)
                      break
                    }
                  } catch {}
                }
                // fallback: none from SSE; try to parse last chunk as JSON array
                if (!steps.length) {
                  const last = lines.at(-1)?.slice(6).trim() ?? ''
                  try { steps = JSON.parse(last) } catch {}
                }
                // bullet fallback
                if (!steps.length) {
                  const bullets = base.match(/^\s*(?:[-•*]|\d+[.)])\s+(.+)$/gmi) ?? []
                  steps = bullets.map((b) => b.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, '').trim()).filter(Boolean)
                }
                steps = steps.filter((s) => typeof s === 'string' && s.trim()).slice(0, 7)
                if (!steps.length) return

                // Layout and create
                const positions = layoutSpawnBelow(editor, shape.id, steps.length)
                const childIds = steps.map((text, i) =>
                  createMessageNode(editor, { x: positions[i].x, y: positions[i].y, role: 'assistant', text })
                )
                for (const id of childIds) connectNodes(editor, shape.id, id)
                frameShapes(editor, [shape.id, ...childIds])
              } finally {
                setIsSpawning(false)
              }
            }}
          >
            {isSpawning ? '...' : 'Split'}
          </button>
          <button
            type="submit"
            aria-label="Send message"
            disabled={isLoading}
            className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
