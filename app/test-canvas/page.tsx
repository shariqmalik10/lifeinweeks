"use client";
import { useTLDrawEditor } from '@/app/hooks/useTLDrawEditor';
import { CommandPalette } from '@/components/canvas/command-palatte';
import { NodeChatOverlay } from '@/components/canvas/node-chat-overlay';
import { MessageNodeUtil } from '@/components/canvas/shapes/MessageNode';
import { Tldraw } from 'tldraw';
import "tldraw/tldraw.css"


export default function TestCanvasPage() {
  const { setEditor } = useTLDrawEditor()

  return (
    <div className="fixed inset-0">
      <Tldraw
      hideUi
      shapeUtils={[MessageNodeUtil]}
        onMount={(editor) => {
          setEditor(editor)
        }}
      />
      <CommandPalette />
      {/* <NodeChatOverlay /> */}
    </div>
  )
}
