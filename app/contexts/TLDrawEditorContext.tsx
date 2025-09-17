'use client'

import { createContext, ReactNode, useCallback, useState } from "react";
import { Editor } from "tldraw"

interface TLDrawEditorContext {
  editor: Editor | null
  setEditor: (editor: Editor) => void
}

export const TLDrawEditorContext = createContext<TLDrawEditorContext | undefined>(undefined);

export function TldrawEditorProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(null)

  const handleSetEditor = useCallback((editor: Editor) => {
    setEditor(editor)
  }, [])

  return (
    <TLDrawEditorContext.Provider value={{ editor, setEditor: handleSetEditor }}>
      {children}
    </TLDrawEditorContext.Provider>
  )
}
