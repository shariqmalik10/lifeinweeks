"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface HeroInputProps {
  onDateSubmit: (date: Date, lifespan: number) => void;
  defaultDate?: Date;
}

export function HeroInput({ onDateSubmit, defaultDate }: HeroInputProps) {
  // Default to 25 years ago per DESIGN.md
  const defaultBirthDate = defaultDate || new Date(
    new Date().getFullYear() - 25,
    new Date().getMonth(),
    new Date().getDate()
  );
  
  const [birthDate, setBirthDate] = useState(
    defaultBirthDate.toISOString().split("T")[0]
  );
  const [lifespan, setLifespan] = useState<80 | 90>(90);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date(birthDate);
    if (!isNaN(date.getTime())) {
      onDateSubmit(date, lifespan);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthDate(e.target.value);
    // Auto-submit on date change for immediate feedback
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      onDateSubmit(date, lifespan);
    }
  };

  const handleLifespanChange = (newLifespan: 80 | 90) => {
    setLifespan(newLifespan);
    const date = new Date(birthDate);
    if (!isNaN(date.getTime())) {
      onDateSubmit(date, newLifespan);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-8">
      {/* Title */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-foreground">
          Life in Weeks
        </h1>
        <p className="text-muted-foreground text-lg">
          We live short lives. Take action to make the most out of it.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="birthdate" className="text-sm text-muted-foreground">
            Enter your birth date
          </Label>
          <Input
            id="birthdate"
            type="date"
            value={birthDate}
            onChange={handleDateChange}
            className="text-center text-lg h-12 bg-card border-border focus:border-primary"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Lifespan Toggle */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Expected lifespan
          </Label>
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant={lifespan === 80 ? "default" : "outline"}
              onClick={() => handleLifespanChange(80)}
              className="min-w-[80px]"
            >
              80 years
            </Button>
            <Button
              type="button"
              variant={lifespan === 90 ? "default" : "outline"}
              onClick={() => handleLifespanChange(90)}
              className="min-w-[80px]"
            >
              90 years
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

