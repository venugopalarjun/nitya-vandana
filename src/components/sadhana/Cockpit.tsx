"use client";

import { useState } from "react";
import { usePracticeLog } from "@/hooks/usePracticeLog";
import { useMeditationTimer } from "@/hooks/useMeditationTimer";
import { HareKrishnaPanel } from "./HareKrishnaPanel";
import { GayatriPanel } from "./GayatriPanel";
import { ChalisaPanel } from "./ChalisaPanel";
import { MeditationTimerPanel, MeditationTimerCard } from "./MeditationTimer";
import { RudrakshaCounter, useRudrakshaCounter } from "./RudrakshaCounter";
import { DailyLog } from "./DailyLog";
import chalisaData from "@/content/hanuman-chalisa.json";

const TOTAL_CHALISA_VERSES = chalisaData.chunks.reduce((sum, c) => sum + c.verses.length, 0);

type Mode = "harekrishna" | "gayatri" | "chalisa" | "meditation";

const MODE_META: Record<Mode, { eyebrow: string; title: string; copy: string }> = {
  harekrishna: {
    eyebrow: "Mahamantra",
    title: "Hare Krishna",
    copy: "The Mahamantra from Kali-Santarana Upanishad. Chant and count.",
  },
  gayatri: {
    eyebrow: "Vedic Mantra",
    title: "Gayatri Mantra",
    copy: "Sanskrit, transliteration, English meaning, and japa counting.",
  },
  chalisa: {
    eyebrow: "Daily Chunk",
    title: "Hanuman Chalisa",
    copy: "Devanagari text, transliteration, meaning, and chunk-wise reading for daily continuity.",
  },
  meditation: {
    eyebrow: "Meditation",
    title: "Meditation",
    copy: "A simple start-stop timer. Sit quietly and let the practice settle.",
  },
};

export function Cockpit() {
  const [mode, setMode] = useState<Mode>("harekrishna");
  const [japaTarget, setJapaTarget] = useState(108);
  const [verseIndex, setVerseIndex] = useState(0);
  const {
    todayLog,
    streak,
    addMahamantraCount,
    addGayatriCount,
    markChalisaChunk,
    addMeditationSeconds,
    hydrated,
  } = usePracticeLog();

  const meditation = useMeditationTimer(addMeditationSeconds);
  const mahamantraCounter = useRudrakshaCounter(japaTarget, addMahamantraCount);
  const gayatriCounter = useRudrakshaCounter(japaTarget, addGayatriCount);
  const activeCounter = mode === "harekrishna" ? mahamantraCounter : gayatriCounter;

  if (!hydrated) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-[var(--primary)] text-3xl font-devanagari">ॐ</div>
      </div>
    );
  }

  const meta = MODE_META[mode];

  return (
    <div className="p-[14px] min-h-screen max-[980px]:p-[10px]">
      <div className="cockpit-shell">
        {/* Decorative layers */}
        <div className="mandala-ring" />

        <div className="lotus-geometry" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="lotus-petal"
              style={{ transform: `rotate(${i * 30}deg)` }}
            />
          ))}
          <span className="lotus-core" />
        </div>

        <div className="peacock-mark" aria-hidden="true">
          <div className="feather-stem" />
          <div className="feather-curve" />
          <div className="feather-eye" />
        </div>

        {/* Topbar */}
        <header className="cockpit-topbar">
          <div className="flex items-center gap-[10px]">
            <div className="brand-mark">ॐ</div>
            <h1 className="text-[24px] leading-tight tracking-tight m-0 max-[560px]:text-[20px]">
              Nitya Vandana
            </h1>
          </div>

          <div className="flex flex-wrap justify-end gap-[9px] max-[980px]:justify-start">
            <div className="pill">
              <span className="pill-dot" /> Streak{" "}
              <strong>{streak > 0 ? `${streak} day${streak > 1 ? "s" : ""}` : "—"}</strong>
            </div>
          </div>
        </header>

        {/* Main layout */}
        <main className="cockpit-layout">
          {/* Left column */}
          <section>
            {/* Mode row */}
            <div className="flex flex-wrap gap-[9px] mb-[10px]">
              {(["harekrishna", "gayatri", "chalisa", "meditation"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`mode-btn ${mode === m ? "mode-btn-active" : ""}`}
                >
                  {m === "harekrishna" ? "Hare Krishna" : m === "gayatri" ? "Gayatri" : m === "chalisa" ? "Hanuman Chalisa" : "Meditation"}
                </button>
              ))}
            </div>

            {/* Main panel */}
            <div className="main-panel">
              <div className="panel-header max-[980px]:flex-col max-[980px]:items-start">
                <div>
                  <div className="eyebrow">{meta.eyebrow}</div>
                  <h2 className="panel-title">{meta.title}</h2>
                  <p className="panel-copy">{meta.copy}</p>
                </div>
              </div>

              <div className="panel-body">
                {mode === "harekrishna" && <HareKrishnaPanel />}
                {mode === "gayatri" && <GayatriPanel />}
                {mode === "chalisa" && (
                  <ChalisaPanel
                    completedChunks={todayLog.chalisaChunksRead}
                    currentVerseIndex={verseIndex}
                    onVerseIndexChange={setVerseIndex}
                    onMarkChunk={markChalisaChunk}
                  />
                )}
                {mode === "meditation" && (
                  <MeditationTimerPanel timer={meditation} />
                )}
              </div>

              <div className="panel-footer max-[980px]:flex-col max-[980px]:items-start">
                <div className="flex flex-wrap gap-[9px]">
                  {(mode === "harekrishna" || mode === "gayatri") && (
                    <>
                      <button className="btn btn-primary" onClick={activeCounter.tap}>◉ Count One</button>
                      {[11, 21, 54, 108].map((c) => (
                        <button
                          key={c}
                          onClick={() => setJapaTarget(c)}
                          className={`btn ${japaTarget === c ? "count-btn-active" : ""}`}
                        >
                          {c}
                        </button>
                      ))}
                    </>
                  )}
                  {mode === "chalisa" && (
                    <>
                      <button
                        className="btn"
                        disabled={verseIndex === 0}
                        onClick={() => setVerseIndex(Math.max(0, verseIndex - 1))}
                      >
                        ← Previous
                      </button>
                      <button
                        className="btn"
                        disabled={verseIndex === TOTAL_CHALISA_VERSES - 1}
                        onClick={() => setVerseIndex(Math.min(TOTAL_CHALISA_VERSES - 1, verseIndex + 1))}
                      >
                        Next →
                      </button>
                    </>
                  )}
                  {mode === "meditation" && (
                    <button onClick={meditation.toggle} className="btn btn-primary">
                      {meditation.running ? "⏸ Stop" : "▶ Start"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Right sidebar */}
          <aside className="grid gap-[10px] content-start">
            <RudrakshaCounter
              target={japaTarget}
              onTargetChange={(t) => { setJapaTarget(t); activeCounter.clampTo(t); }}
              count={activeCounter.count}
              onTap={activeCounter.tap}
              onUndo={activeCounter.undo}
              onReset={activeCounter.reset}
            />

            <MeditationTimerCard timer={meditation} />

            <DailyLog log={todayLog} />
          </aside>
        </main>
      </div>
    </div>
  );
}
