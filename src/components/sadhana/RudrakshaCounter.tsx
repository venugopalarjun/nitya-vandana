"use client";

import { useState, useCallback, useRef } from "react";

interface RudrakshaCounterProps {
  target: number;
  onTargetChange: (t: number) => void;
  onComplete?: (count: number) => void;
}

const TARGETS = [11, 21, 54, 108];

export function RudrakshaCounter({
  target,
  onTargetChange,
  onComplete,
}: RudrakshaCounterProps) {
  const [count, setCount] = useState(0);
  const [animating, setAnimating] = useState(false);
  const completed = count >= target;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tap = useCallback(() => {
    if (completed) return;
    setCount((c) => {
      const next = Math.min(c + 1, target);
      if (next >= target && onComplete) onComplete(target);
      return next;
    });
    setAnimating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAnimating(false), 320);
  }, [completed, target, onComplete]);

  const undo = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);
  const reset = useCallback(() => setCount(0), []);

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
            onClick={tap}
            disabled={completed}
            className={`bead-btn ${animating ? "bead-animate" : ""}`}
            aria-label="Tap rudraksha bead"
          >
            <span className="bead-core" />
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
              <button onClick={undo} disabled={count === 0} className="btn text-[13px] py-2 px-[11px] disabled:opacity-30">
                ↶ Undo
              </button>
              <button onClick={reset} disabled={count === 0} className="btn text-[13px] py-2 px-[11px] disabled:opacity-30">
                ↻ Reset
              </button>
              {TARGETS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onTargetChange(t);
                    if (count > t) setCount(t);
                  }}
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
