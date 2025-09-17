'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTLDrawEditor } from '@/app/hooks/useTLDrawEditor'
import { createShapeId, TLGeoShape, TLShapeId, toRichText } from 'tldraw'
import { useCompletion } from '@ai-sdk/react'

const BASE_W = 1200
const BASE_H = 100

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const { editor } = useTLDrawEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const currentShapeRef = useRef<TLShapeId | null>(null)

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/prompt',
    onFinish: () => {
      currentShapeRef.current = null;
    }
  })

  useEffect(() => {
    if (!editor || !isLoading) return
    if (currentShapeRef.current) return

    const shapeId = createShapeId()
    const point = editor.inputs.currentPagePoint || editor.getViewportScreenCenter()

    editor.createShapes<TLGeoShape>([
      {
        id: shapeId,
        type: 'geo',
        x: point.x,
        y: point.y,
        props: {
          geo: 'rectangle',
          w: BASE_W,
          h: BASE_H,
          dash: 'draw',
          color: 'blue',
          size: 'm',
        },
      },
    ])

    currentShapeRef.current = shapeId
  }, [editor, completion])

  useEffect(() => {
    if (!editor) return
    const id = currentShapeRef.current
    if (!id) return

    const text = (completion ?? '').trim()
    if (text.length === 0) return

    try {
      editor.updateShape<TLGeoShape>({
        id,
        type: 'geo',
        props: {
          h: BASE_H,
          richText: toRichText(text),
        },
      })
    } catch (err) {
      console.error('Failed to update shape:', err)
    }
  }, [editor, completion])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen) {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setInput('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Autofocus input when palette opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editor || !input || isLoading) return

    if (input.startsWith('add ')) {
      const prompt = input.slice(4).trim()
      if (!prompt) return

      // Close UI immediately; run completion
      setIsOpen(false)
      setInput('')

      // Keep the API contract consistent. Option A: simple prompt.
      await complete(prompt)

      // Option B (if your server expects messages):
      // await complete('', {
      //     body: { messages: [{ role: 'user', content: prompt }] },
      // })
    } else {
      console.log('Unknown command:', input)
      setIsOpen(false)
      setInput('')
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-lg shadow-2xl p-1 min-w-[500px]"
      >
        <div className="flex items-center px-3">
          <span className="text-gray-400 text-lg">/</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="add <your prompt>"
            className="w-full px-2 py-3 outline-none text-lg"
            onKeyDown={(e) => e.stopPropagation()}
            disabled={isLoading}
          />
          {isLoading && (
            <span className="text-blue-500 text-sm animate-pulse">
              Streaming...
            </span>
          )}
        </div>

        <div className="px-4 pb-2 text-xs text-gray-500">
          {input === '' && (
            <span>Type "add" followed by your prompt • ESC to close</span>
          )}
        </div>
      </form>
    </div>,
    document.body
  )
}
