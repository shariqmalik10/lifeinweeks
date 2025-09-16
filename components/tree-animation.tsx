"use client";

export function TreeAnimation() {
  return (
    <div className="w-full h-full">
      <iframe
        src="/sakura/index.html"
        title="Sakura Animation"
        className="w-full h-full border-0"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
