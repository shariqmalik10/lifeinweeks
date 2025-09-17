'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTLDrawEditor } from '@/app/hooks/useTLDrawEditor'
import { createShapeId, TLShape, TLShapeId, toRichText } from 'tldraw'
import { useCompletion } from '@ai-sdk/react';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const { editor } = useTLDrawEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const currentShapeRef = useRef<TLShapeId | null>(null)

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/prompt',

    onFinish: (initialPrompt, completion) => {
      if (!currentShapeRef.current && editor) {
        const shapeId = createShapeId()
        const point = editor.inputs.currentPagePoint || editor.getViewportScreenCenter()

        editor.createShape({
          id: shapeId,
          type: 'note',
          x: point.x - 200,
          y: point.y - 100,
          props: {
            richText: toRichText(completion),
            color: 'blue',
          }
        })
      }
      currentShapeRef.current = null
    },
  })

  console.log("completin", completion)


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

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editor || !input || isLoading) return

    if (input.startsWith('add ')) {
      const prompt = input.slice(4).trim() // Remove 'add ' prefix

      if (prompt) {
        setIsOpen(false)
        setInput('')

        await complete(prompt, {
          body: {
            messages: [
              { role: 'user', content: prompt }
            ]
          }
        })
      }
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
