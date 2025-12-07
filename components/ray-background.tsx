"use client";

import { useEffect, useState } from "react";

interface RayBackgroundProps {
  className?: string;
  isStatic?: boolean;
}

export function RayBackground({ className = "h-screen", isStatic = false }: RayBackgroundProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (navigator?.hardwareConcurrency > 4) {
      setAnimated(true);
    }
  }, []);

  return (
    <div
      className={`absolute flex flex-col z-[40] w-full !max-w-full items-center justify-center bg-transparent transition-bg overflow-hidden pointer-events-none ${className}`}
    >
      <div
        className={`ray absolute opacity-60 ${animated ? "-animate" : ""} ${isStatic ? "-static" : ""}`}
      />
    </div>
  );
}

