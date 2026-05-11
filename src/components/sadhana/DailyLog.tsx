"use client";

import type { DailyLog as DailyLogType } from "@/hooks/usePracticeLog";

interface DailyLogProps {
  log: DailyLogType;
}

export function DailyLog({ log }: DailyLogProps) {
  const formatDuration = (s: number) => {
    if (s === 0) return "—";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m === 0) return `${sec}s`;
    return sec > 0 ? `${m}m ${sec.toString().padStart(2, "0")}s` : `${m}m`;
  };

  const items = [
    { label: "Hare Krishna", value: (log.mahamantraCount || 0) > 0 ? `${log.mahamantraCount} chants` : "—" },
    { label: "Gayatri", value: log.gayatriCount > 0 ? `${log.gayatriCount} chants` : "—" },
    { label: "Hanuman Chalisa", value: log.chalisaChunksRead.length > 0 ? `${log.chalisaChunksRead.length} chunk${log.chalisaChunksRead.length > 1 ? "s" : ""}` : "—" },
    { label: "Meditation", value: formatDuration(log.meditationSeconds) },
  ];

  return (
    <div className="side-card">
      <div className="side-card-inner">
        <div className="flex justify-between items-start gap-[10px] mb-2">
          <div>
            <h3 className="text-[17px] tracking-tight text-[var(--foreground)] m-0">
              Today&apos;s Log
            </h3>
          </div>
          <div className="card-tag">Private</div>
        </div>

        <div className="grid gap-[10px]">
          {items.map((item) => (
            <div key={item.label} className="log-row">
              <span className="text-[var(--muted-foreground)]">{item.label}</span>
              <strong className="text-[var(--foreground)]">{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
