"use client";

import type { ChartData } from "@/hooks/useJyotishProfile";
import matrix from "@/content/jyotish-matrix.json";

const PLANET_ORDER = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];

const PLANET_LABELS: Record<string, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury",
  jupiter: "Jupiter", venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};

interface GrahaCardStripProps {
  chart: ChartData;
  selectedPlanet: string | null;
  onSelect: (key: string) => void;
}

export function GrahaCardStrip({ chart, selectedPlanet, onSelect }: GrahaCardStripProps) {
  return (
    <div className="flex flex-wrap gap-[6px]">
      {PLANET_ORDER.map((key) => {
        const graha = chart.grahas[key];
        if (!graha) return null;
        const isActive = selectedPlanet === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`graha-chip ${isActive ? "graha-chip-active" : ""}`}
          >
            <span className="font-medium">{PLANET_LABELS[key]}</span>
            <span className="text-[var(--muted-foreground)]">·</span>
            <span>{graha.house}{ordinal(graha.house)}</span>
          </button>
        );
      })}
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
