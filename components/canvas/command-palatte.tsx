'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTLDrawEditor } from '@/app/hooks/useTLDrawEditor'
import { createShapeId, TLGeoShape, TLShapeId, toRichText } from 'tldraw'
import { createMessageNode, linkNodes, updateMessageNodeText } from './nodes'
import { useCompletion } from '@ai-sdk/react'

const BASE_W = 1200
const BASE_H = 100

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const { editor } = useTLDrawEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const currentShapeRef = useRef<TLShapeId | null>(null)
  const lastNodeRef = useRef<TLShapeId | null>(null)

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/prompt',
    onFinish: () => {
      console.log('Streaming finished')
      currentShapeRef.current = null;
    },
    onError: (error: any) => {
      console.error('Streaming error:', error)
    }
  })

  useEffect(() => {
    if (!editor || !isLoading) return
    if (currentShapeRef.current) return

    console.log('Creating message node for streaming')
    const nodeId = createMessageNode(editor, { role: 'assistant', text: '', width: BASE_W, height: BASE_H })
    if (lastNodeRef.current) {
      linkNodes(editor, lastNodeRef.current, nodeId)
    }
    currentShapeRef.current = nodeId
    lastNodeRef.current = nodeId
  }, [editor, isLoading])

  useEffect(() => {
    if (!editor) return
    const id = currentShapeRef.current
    if (!id) return

    const text = (completion ?? '').trim()
    if (text.length === 0) return

    console.log('Updating shape with text:', text.substring(0, 50) + '...')

    updateMessageNodeText(editor, id, text, BASE_H)
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
      const commandText = input.slice(4).trim()
      if (!commandText) return

      // Parse model and prompt
      let model = 'deepseek-v3'
      let prompt = commandText

      // Check if it starts with a model name
      const modelMap: Record<string, string> = {
        'deepseek': 'deepseek/deepseek-chat',
        'deepseek-v3': 'deepseek/deepseek-v3',
        'deepseek-v31': 'deepseek/deepseek-v3',
        'gpt4': 'openai/gpt-4',
        'gpt-4': 'openai/gpt-4',
        'claude': 'anthropic/claude-3-haiku',
        'claude3': 'anthropic/claude-3-haiku',
      }

      const words = commandText.split(' ')
      const firstWord = words[0].toLowerCase()

      if (modelMap[firstWord]) {
        model = modelMap[firstWord]
        prompt = words.slice(1).join(' ')
      }

      if (!prompt) return

      console.log(`Using model: ${model}`)
      setIsOpen(false)
      setInput('')

      await complete(prompt, { body: { model } })

    } else if (input.startsWith('chain ')) {
      const commandText = input.slice(6).trim()
      if (!commandText) return

      let model = 'deepseek-v3'
      let prompt = commandText

      const modelMap: Record<string, string> = {
        'deepseek': 'deepseek/deepseek-chat',
        'deepseek-v3': 'deepseek/deepseek-v3',
        'deepseek-v31': 'deepseek/deepseek-v3',
        'gpt4': 'openai/gpt-4',
        'gpt-4': 'openai/gpt-4',
        'claude': 'anthropic/claude-3-haiku',
        'claude3': 'anthropic/claude-3-haiku',
      }

      const words = commandText.split(' ')
      const firstWord = words[0].toLowerCase()
      if (modelMap[firstWord]) {
        model = modelMap[firstWord]
        prompt = words.slice(1).join(' ')
      }

      if (!prompt) return

      // Create user node first
      const userNodeId = createMessageNode(editor, { role: 'user', text: prompt, width: 420, height: 140 })
      if (lastNodeRef.current) {
        linkNodes(editor, lastNodeRef.current, userNodeId)
      }
      console.log("this is the lastnoderef data: ")
      console.log(lastNodeRef)
      lastNodeRef.current = userNodeId

      // Then trigger streaming which will create assistant node and link from the last node
      console.log(`Chaining streaming with model: ${model}`)
      setIsOpen(false)
      setInput('')
      await complete(prompt, { body: { model } })

    } else if (input.startsWith('msg ')) {
      const text = input.slice(4).trim()
      if (!text || !editor) return
      const nodeId = createMessageNode(editor, { role: 'user', text, width: 420, height: 140 })
      if (lastNodeRef.current) {
        linkNodes(editor, lastNodeRef.current, nodeId)
      }
      lastNodeRef.current = nodeId
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
            placeholder="add [model] <your prompt>"
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
            <div>
              <div>Type "add [model] &lt;prompt&gt;" • ESC to close</div>
              <div className="mt-1 text-gray-400">Models: deepseek, deepseek-v3, gpt4, claude, or default (gpt-3.5)</div>
            </div>
          )}
        </div>
      </form>
    </div>,
    document.body
  )
}
