"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type TimeUnit = "years" | "months" | "weeks";

interface GranularityToggleProps {
  value: TimeUnit;
  onChange: (unit: TimeUnit) => void;
  className?: string;
}

const units: { value: TimeUnit; label: string }[] = [
  { value: "years", label: "Y" },
  { value: "months", label: "M" },
  { value: "weeks", label: "W" },
];

export function GranularityToggle({ value, onChange, className }: GranularityToggleProps) {
  return (
    <div className={cn("flex rounded-full bg-secondary p-0.5", className)}>
      {units.map((unit) => (
        <button
          key={unit.value}
          type="button"
          onClick={() => onChange(unit.value)}
          className={cn(
            "relative rounded-full px-3 py-1.5 text-xs font-semibold uppercase transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            value === unit.value
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {value === unit.value && (
            <motion.div
              layoutId="granularityPill"
              className="absolute inset-0 rounded-full bg-primary"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10">{unit.label}</span>
        </button>
      ))}
    </div>
  );
}
