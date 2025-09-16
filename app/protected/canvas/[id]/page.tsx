// app/protected/canvas/[id]/page.tsx


"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import TldrawCanvas from '@/components/tldraw-canvas';

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CanvasPage({ params }: PageProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const router = useRouter();
  const { id: canvasId } = use(params);
  
  useEffect(() => {
    // 1. Validate format
    if (!/^[a-zA-Z0-9-]+$/.test(canvasId)) {
      router.push('/protected/canvas');
      return;
    }
    
    // 2. Check if canvas exists
    const canvasData = localStorage.getItem(`canvas-${canvasId}`);
    if (!canvasData) {
      router.push('/protected/canvas');
      return;
    }
    
    setIsValid(true);
  }, [canvasId, router]);
  
  if (isValid === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading canvas...</div>
      </div>
    );
  }
  
  if (isValid === false) {
    return null; // Will redirect
  }
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/protected/canvas')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Canvases
          </button>
          <h1 className="text-xl font-semibold">Canvas {canvasId}</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Auto-saving...
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1">
        <TldrawCanvas canvasId={canvasId} />
      </div>
    </div>
  );
}