"use client";
import { useTLDrawEditor } from '@/app/hooks/useTLDrawEditor';
import { Tldraw } from 'tldraw';
import "tldraw/tldraw.css"


export default function CanvasPage() {
  const { setEditor } = useTLDrawEditor()

  return (
    <div className="fixed inset-0">
      <Tldraw
        onMount={(editor) => {
          setEditor(editor)
          console.log('Editor mounted and available globally')
        }}
      />
    </div>
  )
}
