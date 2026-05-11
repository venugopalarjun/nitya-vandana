"use client";

import { useCallback, useRef, useState } from "react";

interface RudrakshaCounterProps {
  target: number;
  onTargetChange: (t: number) => void;
  count: number;
  onTap: () => void;
  onUndo: () => void;
  onReset: () => void;
}

const TARGETS = [11, 21, 54, 108];

export function useRudrakshaCounter(target: number, onComplete?: (count: number) => void) {
  const [count, setCount] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const tap = useCallback(() => {
    setCount((c) => {
      if (c >= target) return c;
      const next = c + 1;
      if (next >= target && onCompleteRef.current) onCompleteRef.current(target);
      return next;
    });
  }, [target]);

  const undo = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);
  const reset = useCallback(() => setCount(0), []);
  const clampTo = useCallback((t: number) => setCount((c) => Math.min(c, t)), []);

  return { count, tap, undo, reset, clampTo };
}

export function RudrakshaCounter({
  target,
  onTargetChange,
  count,
  onTap,
  onUndo,
  onReset,
}: RudrakshaCounterProps) {
  const [animating, setAnimating] = useState(false);
  const completed = count >= target;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(() => {
    if (completed) return;
    onTap();
    setAnimating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAnimating(false), 320);
  }, [completed, onTap]);

  const progress = Math.min((count / target) * 100, 100);

  return (
    <div className="side-card side-card-active">
      <div className="side-card-inner">
        <div className="flex justify-between items-start gap-[10px] mb-2">
          <div>
            <h3 className="text-[17px] tracking-tight text-[var(--foreground)] m-0">
              Rudraksha Counter
            </h3>
          </div>
          <div className="card-tag">
            {count}/{target}
          </div>
        </div>

        <div className="flex items-center gap-[14px] max-[560px]:flex-col max-[560px]:items-start">
          <button
            onClick={handleTap}
            disabled={completed}
            className={`bead-btn ${animating ? "bead-animate" : ""}`}
            aria-label="Tap rudraksha bead"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13" fill="var(--color-rudraksha)" stroke="rgba(201,162,74,0.5)" strokeWidth="1"/>
              <ellipse cx="16" cy="16" rx="4" ry="13" fill="none" stroke="rgba(201,162,74,0.35)" strokeWidth="0.8"/>
              <ellipse cx="16" cy="16" rx="9" ry="13" fill="none" stroke="rgba(201,162,74,0.25)" strokeWidth="0.8"/>
              <line x1="3" y1="16" x2="29" y2="16" stroke="rgba(201,162,74,0.3)" strokeWidth="0.8"/>
              <circle cx="16" cy="4" r="2.5" fill="rgba(139,90,43,0.9)" stroke="rgba(201,162,74,0.4)" strokeWidth="0.6"/>
              <ellipse cx="16" cy="4" rx="1.2" ry="1.8" fill="rgba(80,50,20,0.6)"/>
            </svg>
          </button>

          <div className="w-full">
            <div className="flex justify-between items-end gap-3 mb-[9px]">
              <span className="text-sm text-[var(--muted-foreground)]">
                Current mala
              </span>
              <span className="text-[var(--text-strong)] font-mono text-[26px] leading-none">
                {count}
              </span>
            </div>
            <div className="counter-progress">
              <div
                className="counter-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-[13px]">
              <button onClick={onUndo} disabled={count === 0} className="btn text-[13px] py-2 px-[11px] disabled:opacity-30">
                ↶ Undo
              </button>
              <button onClick={onReset} disabled={count === 0} className="btn text-[13px] py-2 px-[11px] disabled:opacity-30">
                ↻ Reset
              </button>
              {TARGETS.map((t) => (
                <button
                  key={t}
                  onClick={() => onTargetChange(t)}
                  className={`btn text-[13px] py-2 px-[11px] ${target === t ? "count-btn-active" : ""}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
