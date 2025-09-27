 'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTLDrawEditor } from '@/app/hooks/useTLDrawEditor'
import { useCompletion } from '@ai-sdk/react'
import { TLShapeId, useValue } from 'tldraw'
import { updateMessageNodeText } from './nodes'

export function NodeChatOverlay() {
    const { editor } = useTLDrawEditor()
    const [input, setInput] = useState('')
    const currentTargetRef = useRef<TLShapeId | null>(null)
  
    // Track selection and camera reactively so the overlay stays glued to the node
    const selectedIds = useValue('selection', () => editor?.getSelectedShapeIds() ?? [], [editor])
    const camera = useValue('camera', () => editor?.getCamera() ?? { x: 0, y: 0, z: 1 }, [editor])
  
    const activeId = selectedIds.length === 1 ? (selectedIds[0] as TLShapeId) : null
  
    // Compute screen-space bounds for the selected node
    const bounds = useMemo(() => {
      if (!editor || !activeId) return null
      const b = editor.getShapePageBounds(activeId)
      if (!b) return null
      const { x, y, w, h } = b
      const { x: cx, y: cy, z } = camera
      return { x: (x - cx) * z, y: (y - cy) * z, w: w * z, h: h * z }
    }, [editor, activeId, camera])

    const { complete, completion, isLoading } = useCompletion({
        api: '/api/prompt',
        onFinish: () => {
          currentTargetRef.current = null
        },
    })

    // When streaming starts, bind the target node id
  useEffect(() => {
    if (!editor || !activeId) return
    if (!isLoading) return
    currentTargetRef.current = activeId
  }, [editor, activeId, isLoading])

  // Stream chunks into the bound node
  useEffect(() => {
    const id = currentTargetRef.current
    if (!editor || !id) return
    const text = (completion ?? '').trim()
    if (!text) return
    updateMessageNodeText(editor, id, text)
  }, [editor, completion])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editor || !activeId || !input || isLoading) return
    await complete(input) // you can pass { body: { model } } later per-node
    setInput('')
  }

  if (!editor || !activeId || !bounds) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]">
      <form
        onSubmit={onSubmit}
        className="pointer-events-auto absolute flex gap-2"
        style={{
          left: bounds.x + 12,
          top: bounds.y + bounds.h - 44,
          width: Math.max(260, bounds.w - 24),
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full px-3 py-2 rounded border"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
