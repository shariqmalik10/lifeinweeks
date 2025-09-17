import { useContext, useState } from "react";
import { TLDrawEditorContext } from "../contexts/TLDrawEditorContext";

export function useTLDrawEditor() {
  const context = useContext(TLDrawEditorContext)
  if (context === undefined) {
    throw new Error('useTldrawEditor must be used within a TldrawEditorProvider')
  }
  return context
}
