"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export type TimeUnit = "weeks" | "months" | "years";

interface ViewControlsProps {
  timeUnit: TimeUnit;
  onTimeUnitChange: (unit: TimeUnit) => void;
  focusRemaining: boolean;
  onFocusRemainingChange: (focus: boolean) => void;
  onJumpToYear: (year: number) => void;
  minYear: number;
  maxYear: number;
}

export function ViewControls({
  timeUnit,
  onTimeUnitChange,
  focusRemaining,
  onFocusRemainingChange,
  onJumpToYear,
  minYear,
  maxYear,
}: ViewControlsProps) {
  const [jumpYear, setJumpYear] = useState("");

  const handleJumpToYear = () => {
    const year = parseInt(jumpYear, 10);
    if (!isNaN(year) && year >= minYear && year <= maxYear) {
      onJumpToYear(year);
      setJumpYear("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJumpToYear();
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 md:items-end md:justify-between py-4 border-y border-border">
      {/* Time Unit Switcher */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
          Time Unit
        </Label>
        <div className="flex gap-1" role="group" aria-label="Time unit options">
          {(["years", "months", "weeks"] as TimeUnit[]).map((unit) => (
            <Button
              key={unit}
              variant={timeUnit === unit ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeUnitChange(unit)}
              aria-pressed={timeUnit === unit}
              className="capitalize"
            >
              {unit}
            </Button>
          ))}
        </div>
      </div>

      {/* Jump To Year */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
          Jump to Year
        </Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={`${minYear}-${maxYear}`}
            value={jumpYear}
            onChange={(e) => setJumpYear(e.target.value)}
            onKeyDown={handleKeyDown}
            min={minYear}
            max={maxYear}
            className="w-28 h-8 text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToYear}
            disabled={!jumpYear}
          >
            Go
          </Button>
        </div>
      </div>

      {/* Focus Remaining Toggle */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
          Focus Remaining
        </Label>
        <Button
          variant={focusRemaining ? "default" : "outline"}
          size="sm"
          onClick={() => onFocusRemainingChange(!focusRemaining)}
          aria-pressed={focusRemaining}
        >
          {focusRemaining ? "On" : "Off"}
        </Button>
      </div>
    </div>
  );
}

