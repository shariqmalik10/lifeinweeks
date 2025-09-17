"use client";
import { Tldraw } from 'tldraw';
import "tldraw/tldraw.css"


export default function CanvasPage() {
  return (
    <div className="absolute inset-0">
      <Tldraw />
    </div>
  )
}
