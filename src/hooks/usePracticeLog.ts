"use client";

import { useLocalStorage } from "./useLocalStorage";

export interface DailyLog {
  date: string;
  gayatriCount: number;
  chalisaChunksRead: string[];
  meditationSeconds: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function usePracticeLog() {
  const [logs, setLogs, hydrated] = useLocalStorage<Record<string, DailyLog>>(
    "nitya-practice-logs",
    {}
  );

  const today = todayKey();
  const todayLog: DailyLog = logs[today] || {
    date: today,
    gayatriCount: 0,
    chalisaChunksRead: [],
    meditationSeconds: 0,
  };

  function updateToday(partial: Partial<DailyLog>) {
    setLogs((prev) => ({
      ...prev,
      [today]: { ...todayLog, ...partial, date: today },
    }));
  }

  function addGayatriCount(count: number) {
    updateToday({ gayatriCount: todayLog.gayatriCount + count });
  }

  function markChalisaChunk(chunkId: string) {
    if (!todayLog.chalisaChunksRead.includes(chunkId)) {
      updateToday({
        chalisaChunksRead: [...todayLog.chalisaChunksRead, chunkId],
      });
    }
  }

  function addMeditationSeconds(seconds: number) {
    updateToday({
      meditationSeconds: todayLog.meditationSeconds + seconds,
    });
  }

  const streak = (() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      const log = logs[key];
      if (
        log &&
        (log.gayatriCount > 0 ||
          log.chalisaChunksRead.length > 0 ||
          log.meditationSeconds > 0)
      ) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  })();

  return {
    todayLog,
    streak,
    addGayatriCount,
    markChalisaChunk,
    addMeditationSeconds,
    hydrated,
  };
}
