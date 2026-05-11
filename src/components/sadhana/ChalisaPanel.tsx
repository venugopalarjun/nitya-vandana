"use client";

import { useMemo } from "react";
import chalisaData from "@/content/hanuman-chalisa.json";
import { TextTriad } from "./TextTriad";

interface FlatVerse {
  chunkId: string;
  chunkTitle: string;
  devanagari: string;
  transliteration: string;
  meaning: string;
  isLastInChunk: boolean;
}

interface ChalisaPanelProps {
  completedChunks: string[];
  currentVerseIndex: number;
  onVerseIndexChange: (i: number) => void;
  onMarkChunk: (chunkId: string) => void;
}

export function ChalisaPanel({
  completedChunks,
  currentVerseIndex,
  onVerseIndexChange,
  onMarkChunk,
}: ChalisaPanelProps) {
  const allVerses = useMemo<FlatVerse[]>(() => {
    const flat: FlatVerse[] = [];
    for (const chunk of chalisaData.chunks) {
      chunk.verses.forEach((v, i) => {
        flat.push({
          chunkId: chunk.id,
          chunkTitle: chunk.title,
          devanagari: v.devanagari,
          transliteration: v.transliteration,
          meaning: v.meaning,
          isLastInChunk: i === chunk.verses.length - 1,
        });
      });
    }
    return flat;
  }, []);

  const total = allVerses.length;
  const verse = allVerses[currentVerseIndex];
  const isLast = currentVerseIndex === total - 1;
  const chunkDone = completedChunks.includes(verse.chunkId);
  const allDone = completedChunks.length === chalisaData.chunks.length;

  const handleContinue = () => {
    // Mark current chunk complete if at its last verse
    if (verse.isLastInChunk && !chunkDone) {
      onMarkChunk(verse.chunkId);
    }
    if (!isLast) {
      onVerseIndexChange(currentVerseIndex + 1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {verse.chunkTitle}
          </span>
          <span className="text-xs text-[var(--muted-foreground)] ml-3">
            {currentVerseIndex + 1} / {total}
          </span>
        </div>
      </div>

      <TextTriad
        devanagari={verse.devanagari}
        transliteration={verse.transliteration}
        meaning={verse.meaning}
      />

      <div className="mt-6 flex justify-center">
        {isLast && allDone ? (
          <div className="text-center text-sm text-[var(--color-tulsi)]">
            ✓ All complete
          </div>
        ) : (
          <button className="btn btn-primary" onClick={handleContinue}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}
