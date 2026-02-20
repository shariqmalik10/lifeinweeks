"use client";

import { Clock, Calendar } from "lucide-react";

export default function TimelinePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="size-6 text-primary" />
        <h1 className="text-2xl font-semibold text-foreground">Timeline</h1>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-24">
        <Calendar className="size-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Timeline View</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md text-center">
          Visualize your life milestones and events on an interactive timeline. This feature is coming soon.
        </p>
      </div>
    </div>
  );
}
