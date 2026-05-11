"use client";

import type { useMeditationTimer } from "@/hooks/useMeditationTimer";

type MeditationState = ReturnType<typeof useMeditationTimer>;

export function MeditationTimerPanel({ timer }: { timer: MeditationState }) {
  return (
    <div className="min-h-[280px] grid place-items-center text-center">
      <div>
        <div className="timer-orb">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v5l3 2" />
            <path d="M9 2h6" />
          </svg>
        </div>
        <div className="timer-large tabular-nums">{timer.formatted}</div>
        <p className="font-meaning italic text-[17px] text-[var(--muted-foreground)] mt-3 max-w-[460px] mx-auto leading-relaxed">
          Begin. Sit. Return. Let the practice become quiet.
        </p>
        <button
          onClick={timer.toggle}
          className="btn btn-primary mt-6 text-base px-8 py-3"
        >
          {timer.running ? "⏸ Stop" : "▶ Start"}
        </button>
      </div>
    </div>
  );
}

export function MeditationTimerCard({ timer }: { timer: MeditationState }) {
  return (
    <div className={`side-card ${timer.running ? "side-card-active" : ""}`}>
      <div className="side-card-inner">
        <div className="flex justify-between items-start gap-[10px] mb-2">
          <div>
            <h3 className="text-[17px] tracking-tight text-[var(--foreground)] m-0">
              Meditation
            </h3>
          </div>
          <div className="card-tag">{timer.formatted}</div>
        </div>

        <div className="flex items-center justify-between gap-[18px]">
          <div className="text-[var(--text-strong)] font-mono text-[32px] tracking-tighter tabular-nums">
            {timer.formatted}
          </div>
          <button onClick={timer.toggle} className="btn">
            {timer.running ? "⏸" : "▶"}
          </button>
        </div>
      </div>
    </div>
  );
}
