"use client";

import type { ChartData } from "@/hooks/useJyotishProfile";
import matrix from "@/content/jyotish-matrix.json";
import { GrahaCardStrip } from "./GrahaCardStrip";

const PLANET_LABELS: Record<string, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury",
  jupiter: "Jupiter", venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};

interface GrahaCardDetailProps {
  planetKey: string;
  chart: ChartData;
  addedPractices: string[];
  onAddPractice: (key: string) => void;
  onRemovePractice: (key: string) => void;
  onBack: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  onSelectPlanet: (key: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function GrahaCardDetail({
  planetKey,
  chart,
  addedPractices,
  onAddPractice,
  onRemovePractice,
  onBack,
  onNavigate,
  onSelectPlanet,
  isFirst,
  isLast,
}: GrahaCardDetailProps) {
  const graha = chart.grahas[planetKey];
  if (!graha) return null;

  const planetMatrix = (matrix.planets as Record<string, {
    title: string;
    mode: string[];
    balanced: string[];
    imbalanced: string[];
    basePractice: string[];
    houses: Record<string, {
      interpretation: string;
      practice: string[];
      reflection: string;
    }>;
  }>)[planetKey];

  if (!planetMatrix) return null;

  const houseData = planetMatrix.houses[String(graha.house)];
  const houseInfo = (matrix.houses as Record<string, { name: string; themes: string[] }>)[String(graha.house)];
  const isPracticeAdded = addedPractices.includes(planetKey);

  return (
    <div className="grid gap-[14px]">
      {/* Planet strip for quick switching */}
      <GrahaCardStrip chart={chart} selectedPlanet={planetKey} onSelect={onSelectPlanet} />

      {/* Card */}
      <div className="graha-card">
        {/* Header */}
        <div className="mb-[14px]">
          <button onClick={onBack} className="text-[11px] text-[var(--primary)] mb-2 hover:underline">
            ← All planets
          </button>
          <h3 className="text-[18px] font-semibold text-[var(--foreground)] tracking-tight">
            {PLANET_LABELS[planetKey]} in the {graha.house}{ordinal(graha.house)} House
          </h3>
          <p className="text-[13px] text-[var(--primary)] mt-1">{planetMatrix.title}</p>
        </div>

        {/* Planet mode */}
        <section className="graha-section">
          <h4 className="graha-section-title">Planet Mode</h4>
          <p className="text-[13px] text-[var(--foreground)] leading-relaxed">
            {PLANET_LABELS[planetKey]} gives results through {planetMatrix.mode.join(", ")}.
          </p>
        </section>

        {/* House area */}
        <section className="graha-section">
          <h4 className="graha-section-title">House Area</h4>
          <p className="text-[13px] text-[var(--foreground)] leading-relaxed">
            The {graha.house}{ordinal(graha.house)} house shows {houseInfo?.name?.toLowerCase()}: {houseInfo?.themes?.join(", ")}.
          </p>
        </section>

        {/* Interpretation */}
        <section className="graha-section">
          <h4 className="graha-section-title">How This Placement Works</h4>
          <p className="text-[13px] text-[var(--foreground)] leading-relaxed">
            {houseData?.interpretation}
          </p>
        </section>

        {/* Balanced / Imbalanced */}
        <div className="grid grid-cols-2 gap-[10px]">
          <section className="graha-section">
            <h4 className="graha-section-title text-[var(--color-tulsi)]">When Balanced</h4>
            <p className="text-[12px] text-[var(--foreground)] leading-relaxed">
              {planetMatrix.balanced.join(", ")}.
            </p>
          </section>
          <section className="graha-section">
            <h4 className="graha-section-title text-[var(--accent)]">When Imbalanced</h4>
            <p className="text-[12px] text-[var(--foreground)] leading-relaxed">
              {planetMatrix.imbalanced.join(", ")}.
            </p>
          </section>
        </div>

        {/* Practice */}
        <section className="graha-section">
          <h4 className="graha-section-title">Practice</h4>
          <ul className="grid gap-[4px]">
            {houseData?.practice?.map((p, i) => (
              <li key={i} className="text-[13px] text-[var(--foreground)] flex items-start gap-[6px]">
                <span className="text-[var(--primary)] mt-[2px]">·</span>
                {p}
              </li>
            ))}
          </ul>
        </section>

        {/* Reflection */}
        <section className="graha-section graha-reflection">
          <h4 className="graha-section-title">Reflection</h4>
          <p className="text-[14px] text-[var(--foreground)] italic leading-relaxed">
            {houseData?.reflection}
          </p>
        </section>

        {/* Add to cockpit */}
        <div className="pt-[10px] border-t border-[var(--border)]">
          {isPracticeAdded ? (
            <button
              onClick={() => onRemovePractice(planetKey)}
              className="text-[12px] text-[var(--color-tulsi)] flex items-center gap-[6px]"
            >
              <span>✓</span> Practice added
              <span className="text-[var(--muted-foreground)] ml-1">(tap to remove)</span>
            </button>
          ) : (
            <button
              onClick={() => onAddPractice(planetKey)}
              className="btn btn-primary text-[12px]"
            >
              Add this practice to cockpit
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => onNavigate("prev")}
          disabled={isFirst}
          className="btn text-[12px]"
        >
          ← Previous
        </button>
        <button
          onClick={() => onNavigate("next")}
          disabled={isLast}
          className="btn text-[12px]"
        >
          Next →
        </button>
      </div>

      {/* Settings badge */}
      <p className="text-[10px] text-[var(--muted-foreground)] text-center">
        {graha.sign} · {graha.degree}° · {graha.nakshatra} Pada {graha.pada} · Lahiri · Whole Sign
      </p>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
