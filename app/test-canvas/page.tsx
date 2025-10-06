"use client";
import { useTLDrawEditor } from '@/app/hooks/useTLDrawEditor';
import { NodeShapeUtil } from '@/components/canvas/nodes/NodeShapeUtil';
import { Tldraw } from 'tldraw';
import "tldraw/tldraw.css"

export default function TestCanvasPage() {
  const { setEditor } = useTLDrawEditor()

  return (
    <div className="fixed inset-0">
      <Tldraw
        hideUi
        shapeUtils={[NodeShapeUtil]}
        onMount={(editor) => {
          setEditor(editor)
          
          // Create a test node on mount to verify Tailwind styles
          editor.createShape({
            type: 'node',
            x: 200,
            y: 200,
            props: {
              node: {
                type: 'message',
                role: 'assistant',
                text: 'Hello! I\'m a message node with Tailwind styling. Type a message below and click Send to test streaming!',
              },
            },
          })
        }}
      />
    </div>
  )
}
