"use client";
import { useTLDrawEditor } from '@/app/hooks/useTLDrawEditor';
import { NodeShapeUtil } from '@/components/canvas/nodes/NodeShapeUtil'
import { ConnectionShapeUtil } from '@/components/canvas/connection/ConnectionShapeUtil'
import { ConnectionBindingUtil } from '@/components/canvas/connection/ConnectionBindingUtil'
import { createMessageNode, connectNodes } from '@/components/canvas/nodes/helpers'
import { Tldraw } from 'tldraw';
import "tldraw/tldraw.css"

export default function TestCanvasPage() {
  const { setEditor } = useTLDrawEditor()

  return (
    <div className="fixed inset-0">
      <Tldraw
        hideUi
        shapeUtils={[NodeShapeUtil, ConnectionShapeUtil]}
        bindingUtils={[ConnectionBindingUtil]}
        onMount={(editor) => {
          setEditor(editor)

          // Guard against duplicate bootstrapping in React Strict Mode / re-mounts
          const hasExistingNode = editor.getCurrentPageShapes().some((s) => s.type === 'node')
          if (hasExistingNode) return

          // Create exactly two nodes and connect them
          const a = createMessageNode(editor, { x: 200, y: 200, role: 'user', text: 'Parent step' })
          const b = createMessageNode(editor, { x: 200, y: 480, role: 'assistant', text: 'Child step' })
          connectNodes(editor, a, b)
        }}
      />
    </div>
  )
}
