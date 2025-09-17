'use client'

import { queryClient } from "@/lib/query-client/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from "react";
import { TldrawEditorProvider } from "./contexts/TLDrawEditorContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TldrawEditorProvider>
        {children}
      </TldrawEditorProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
