"use client";

import chalisaData from "@/content/hanuman-chalisa.json";
import { TextTriad } from "./TextTriad";

interface ChalisaPanelProps {
  completedChunks: string[];
  currentChunkIndex: number;
  onChunkIndexChange: (i: number) => void;
  onMarkChunk: (chunkId: string) => void;
}

export function ChalisaPanel({
  completedChunks,
  currentChunkIndex,
  onChunkIndexChange,
  onMarkChunk,
}: ChalisaPanelProps) {
  const chunk = chalisaData.chunks[currentChunkIndex];
  const totalChunks = chalisaData.chunks.length;
  const isLastChunk = currentChunkIndex === totalChunks - 1;
  const allComplete = completedChunks.length === totalChunks;
  const currentComplete = completedChunks.includes(chunk.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {chunk.title}
          </span>
          <span className="text-xs text-[var(--muted-foreground)] ml-3">
            {currentChunkIndex + 1} / {totalChunks}
          </span>
        </div>
        <div className="flex gap-1">
          {chalisaData.chunks.map((c, i) => (
            <button
              key={c.id}
              onClick={() => onChunkIndexChange(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentChunkIndex
                  ? "bg-[var(--primary)] scale-125"
                  : completedChunks.includes(c.id)
                    ? "bg-[var(--color-tulsi)]"
                    : "bg-[rgba(201,162,74,0.2)]"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-8 max-h-[55vh] overflow-y-auto pr-1">
        {chunk.verses.map((verse, i) => (
          <TextTriad
            key={i}
            devanagari={verse.devanagari}
            transliteration={verse.transliteration}
            meaning={verse.meaning}
          />
        ))}
      </div>

      {/* Show Complete button only at the end of a chunk's verses */}
      {!currentComplete && (
        <div className="mt-6 flex justify-center">
          <button
            className="btn btn-primary"
            onClick={() => {
              onMarkChunk(chunk.id);
              if (!isLastChunk) {
                onChunkIndexChange(currentChunkIndex + 1);
              }
            }}
          >
            {allComplete ? "✓ All Complete" : "Continue →"}
          </button>
        </div>
      )}

      {currentComplete && (
        <div className="mt-6 text-center text-sm text-[var(--color-tulsi)]">
          ✓ Read today
        </div>
      )}
    </div>
  );
}
