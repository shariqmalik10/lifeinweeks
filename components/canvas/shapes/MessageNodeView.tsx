'use client'

import { ReactNode } from 'react'

interface MessageNodeViewProps {
  role: 'user' | 'assistant'
  text: string
  input: string
  setInput: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  widthPercent?: number
}

// Presentational component for the chat node UI only. No editor calls here.
export function MessageNodeView({
  role,
  text,
  input,
  setInput,
  onSubmit,
  isLoading,
  widthPercent = 50,
}: MessageNodeViewProps) {
  const borderClass = role === 'user' ? 'border-purple-600' : 'border-blue-600'

  return (
    <div
      className={`box-border flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-lg ${borderClass}`}
      style={{ width: `${widthPercent}%`, height: '100%' }}
    >
      <div className="inline-flex items-center gap-2 border-b border-slate-200 px-3 py-2 text-xs text-slate-500">
        {role}
      </div>
      <div className="flex-1 p-3">
        <div className="min-h-[200px] whitespace-pre-wrap overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
          {text || ' '}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="box-border grid grid-cols-[1fr_auto] items-center gap-2 border-t border-slate-200 p-3"
        // Prevent canvas selection from swallowing pointer events
        onPointerDown={(e) => e.stopPropagation()}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={isLoading}
          className="rounded-xl bg-blue-600 px-3 py-2 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          // Ensure the button is clickable inside the canvas
          onPointerDown={(e) => e.stopPropagation()}
        >
          Send
        </button>
      </form>
    </div>
  )
}