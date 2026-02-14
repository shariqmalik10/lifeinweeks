"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface BirthDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  maxDate?: Date;
  className?: string;
}

export function BirthDatePicker({
  value,
  onChange,
  maxDate,
  className,
}: BirthDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const month = value.getMonth();
  const day = value.getDate();
  const year = value.getFullYear();

  const now = useMemo(() => maxDate || new Date(), [maxDate]);
  const currentYear = now.getFullYear();

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear; y >= 1920; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  );

  const age = useMemo(() => {
    let a = now.getFullYear() - value.getFullYear();
    const md = now.getMonth() - value.getMonth();
    if (md < 0 || (md === 0 && now.getDate() < value.getDate())) a--;
    return Math.max(0, a);
  }, [value, now]);

  const update = useCallback(
    (m: number, d: number, y: number) => {
      const maxD = new Date(y, m + 1, 0).getDate();
      onChange(new Date(y, m, Math.min(d, maxD)));
    },
    [onChange],
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "w-full text-left group rounded-lg border px-4 py-3 transition-all duration-200",
          isOpen
            ? "border-primary/40 bg-card shadow-lg shadow-primary/5"
            : "border-border bg-card/50 hover:border-primary/30 hover:bg-card/80",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-base font-medium text-foreground tracking-tight truncate">
              {MONTHS_FULL[month]} {day}, {year}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
              {age} years ago
            </p>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 ml-2"
          >
            <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.div>
        </div>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 inset-x-0 mt-2"
          >
            <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
              {/* Column labels */}
              <div className="flex px-2 pt-3 pb-1 gap-1">
                <span className="flex-[1.3] text-[10px] text-muted-foreground uppercase tracking-wider text-center">
                  Month
                </span>
                <span className="flex-[0.7] text-[10px] text-muted-foreground uppercase tracking-wider text-center">
                  Day
                </span>
                <span className="flex-1 text-[10px] text-muted-foreground uppercase tracking-wider text-center">
                  Year
                </span>
              </div>

              {/* Scroll wheels */}
              <div className="flex gap-1 px-2 pb-3">
                <ScrollColumn
                  items={MONTHS_SHORT.map((m, i) => ({ value: i, label: m }))}
                  selectedValue={month}
                  onSelect={(v) => update(v, day, year)}
                  className="flex-[1.3]"
                />
                <ScrollColumn
                  items={days.map((d) => ({
                    value: d,
                    label: String(d).padStart(2, "0"),
                  }))}
                  selectedValue={day}
                  onSelect={(v) => update(month, v, year)}
                  className="flex-[0.7]"
                />
                <ScrollColumn
                  items={years.map((y) => ({ value: y, label: String(y) }))}
                  selectedValue={year}
                  onSelect={(v) => update(month, day, v)}
                  className="flex-1"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll column (single wheel)                                      */
/* ------------------------------------------------------------------ */

const ITEM_H = 32;
const VISIBLE = 7;

interface ScrollColumnProps {
  items: Array<{ value: number; label: string }>;
  selectedValue: number;
  onSelect: (value: number) => void;
  className?: string;
}

function ScrollColumn({
  items,
  selectedValue,
  onSelect,
  className,
}: ScrollColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const suppressRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pad = Math.floor(VISIBLE / 2) * ITEM_H; // 3 items of padding

  // Scroll to selected item on mount and when value changes
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const idx = items.findIndex((i) => i.value === selectedValue);
    if (idx < 0) return;

    suppressRef.current = true;
    el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });

    const t = setTimeout(() => {
      suppressRef.current = false;
    }, 350);
    return () => clearTimeout(t);
  }, [selectedValue, items]);

  // Debounced scroll-end handler: snap to nearest & update
  const onScroll = useCallback(() => {
    if (suppressRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const el = listRef.current;
      if (!el) return;

      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));

      suppressRef.current = true;
      el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      setTimeout(() => {
        suppressRef.current = false;
      }, 350);

      if (items[clamped] && items[clamped].value !== selectedValue) {
        onSelect(items[clamped].value);
      }
    }, 80);
  }, [items, selectedValue, onSelect]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      {/* Center highlight bar */}
      <div
        className="absolute inset-x-0 z-10 pointer-events-none rounded-md bg-primary/8 border-y border-primary/15"
        style={{ top: pad, height: ITEM_H }}
      />

      {/* Top gradient mask */}
      <div
        className="absolute inset-x-0 top-0 z-20 pointer-events-none bg-gradient-to-b from-card via-card/70 to-transparent"
        style={{ height: pad - 4 }}
      />

      {/* Bottom gradient mask */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 pointer-events-none bg-gradient-to-t from-card via-card/70 to-transparent"
        style={{ height: pad - 4 }}
      />

      {/* Scrollable list */}
      <div
        ref={listRef}
        onScroll={onScroll}
        className="overflow-y-auto"
        style={{
          height: VISIBLE * ITEM_H,
          scrollbarWidth: "none",
          scrollSnapType: "y mandatory",
        }}
      >
        {/* Top spacer so first item can center */}
        <div style={{ height: pad }} />

        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelect(item.value)}
            className={cn(
              "w-full flex items-center justify-center text-sm tabular-nums transition-colors duration-100",
              item.value === selectedValue
                ? "text-foreground font-semibold"
                : "text-muted-foreground/40 hover:text-muted-foreground/70",
            )}
            style={{
              height: ITEM_H,
              scrollSnapAlign: "center",
            }}
          >
            {item.label}
          </button>
        ))}

        {/* Bottom spacer so last item can center */}
        <div style={{ height: pad }} />
      </div>
    </div>
  );
}
