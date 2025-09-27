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
  const border = role === 'user' ? '#7c3aed' : '#2563eb'

  return (
    <div
      style={{
        width: `${widthPercent}%`,
        height: '100%',
        border: `2px solid ${border}`,
        borderRadius: 16,
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          fontSize: 12,
          color: '#64748b',
          borderBottom: '1px solid #e5e7eb',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {role}
      </div>
      <div style={{ flex: 1, padding: 12 }}>
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 12,
            minHeight: 80,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          {text || ' '}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 8,
          padding: 12,
          borderTop: '1px solid #e5e7eb',
          alignItems: 'center',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
        // Prevent canvas selection from swallowing pointer events
        onPointerDown={(e) => e.stopPropagation()}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white' }}
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={isLoading}
          style={{
            padding: '10px 12px',
            background: '#2563eb',
            color: 'white',
            borderRadius: 12,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
          // Ensure the button is clickable inside the canvas
          onPointerDown={(e) => e.stopPropagation()}
        >
          Send
        </button>
      </form>
    </div>
  )
}