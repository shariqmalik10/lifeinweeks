"use client";
import { useTLDrawEditor } from '@/app/hooks/useTLDrawEditor';
import { NodeShapeUtil } from '@/components/canvas/nodes/NodeShapeUtil'
import { ConnectionShapeUtil } from '@/components/canvas/connection/ConnectionShapeUtil'
import { ConnectionBindingUtil } from '@/components/canvas/connection/ConnectionBindingUtil'
import { createMessageNode, connectNodes } from '@/components/canvas/nodes/helpers'
import { PointingPort } from '@/components/canvas/ports/PointingPort'
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

          // Register pointing_port tool on the select state so dragging from ports works
          const select = editor.getStateDescendant('select')
          // Only add once across remounts (e.g., React Strict Mode)
          if (select && !(window as any).__pointing_port_registered__) {
            try {
              select.addChild(PointingPort)
              ;(window as any).__pointing_port_registered__ = true
            } catch {}
          }

          // Create exactly one initial node (you will use Split/Expand next)
          createMessageNode(editor, { x: 200, y: 200, role: 'user', text: 'Ask me anything' })
        }}
      />
    </div>
  )
}
