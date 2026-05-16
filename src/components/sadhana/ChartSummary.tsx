"use client";

import type { ChartData } from "@/hooks/useJyotishProfile";
import matrix from "@/content/jyotish-matrix.json";

const PLANET_ORDER = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];

const PLANET_LABELS: Record<string, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury",
  jupiter: "Jupiter", venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};

const PLANET_SYMBOLS: Record<string, string> = {
  sun: "Su", moon: "Mo", mars: "Ma", mercury: "Me",
  jupiter: "Ju", venus: "Ve", saturn: "Sa", rahu: "Ra", ketu: "Ke",
};

// South Indian chart: fixed sign positions in a 4x4 grid
// Each cell index maps to a sign (0-11), with 4 corner cells being empty
const SOUTH_INDIAN_GRID: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

interface ChartSummaryProps {
  chart: ChartData;
  birthPlace: string;
  birthTimeConfidence: "exact" | "approximate" | "unknown";
  onSelectPlanet: (key: string) => void;
  onSelectKarma: () => void;
  onRecalculate: () => void;
  onDeleteProfile: () => void;
}

export function ChartSummary({
  chart,
  birthPlace,
  birthTimeConfidence,
  onSelectPlanet,
  onSelectKarma,
  onRecalculate,
  onDeleteProfile,
}: ChartSummaryProps) {
  const SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];

  const SIGN_ABBREV: Record<string, string> = {
    Aries: "Ar", Taurus: "Ta", Gemini: "Ge", Cancer: "Cn", Leo: "Le", Virgo: "Vi",
    Libra: "Li", Scorpio: "Sc", Sagittarius: "Sg", Capricorn: "Cp", Aquarius: "Aq", Pisces: "Pi",
  };

  // Map sign index to planets in that sign
  const signPlanets: Record<number, string[]> = {};
  for (const [key, data] of Object.entries(chart.grahas)) {
    const signIdx = SIGNS.indexOf(data.sign);
    if (signIdx >= 0) {
      if (!signPlanets[signIdx]) signPlanets[signIdx] = [];
      signPlanets[signIdx].push(PLANET_SYMBOLS[key] || key);
    }
  }

  // Mark lagna sign
  const lagnaIdx = SIGNS.indexOf(chart.core.lagna_sign);

  return (
    <div className="grid gap-[12px]">
      {/* Chart + Core Facts side by side — compact */}
      <div className="chart-summary-row">
        {/* Chart Diagram (South Indian) */}
        <div className="grid grid-cols-4 gap-[1px] chart-grid-sized">
          {SOUTH_INDIAN_GRID.flat().map((signIdx, i) => {
            if (signIdx === null) {
              if (i === 5) {
                return (
                  <div key={i} className="chart-cell-center col-span-1 flex items-end justify-center pb-0.5">
                    <span className="text-[9px] text-[var(--muted-foreground)]">Rashi</span>
                  </div>
                );
              }
              if (i === 6) {
                return (
                  <div key={i} className="chart-cell-center col-span-1 flex items-end justify-center pb-0.5">
                    <span className="text-[9px] text-[var(--muted-foreground)]">Chart</span>
                  </div>
                );
              }
              if (i === 9) {
                return (
                  <div key={i} className="chart-cell-center col-span-1 flex items-start justify-center pt-0.5">
                    <span className="text-[9px] text-[var(--primary)]">{chart.core.lagna_sign}</span>
                  </div>
                );
              }
              if (i === 10) {
                return (
                  <div key={i} className="chart-cell-center col-span-1 flex items-start justify-center pt-0.5">
                    <span className="text-[9px] text-[var(--primary)]">Lagna</span>
                  </div>
                );
              }
              return <div key={i} className="chart-cell-center" />;
            }

            const isLagna = signIdx === lagnaIdx;
            const planets = signPlanets[signIdx] || [];

            return (
              <div
                key={i}
                className={`chart-cell ${isLagna ? "chart-cell-lagna" : ""}`}
              >
                <span className="text-[9px] text-[var(--muted-foreground)] leading-none">
                  {SIGN_ABBREV[SIGNS[signIdx]]}
                </span>
                {planets.length > 0 && (
                  <span className="text-[10px] font-medium text-[var(--foreground)] leading-tight text-center">
                    {planets.join(" ")}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Core Facts — stacked vertically beside chart */}
        <div className="chart-facts-col">
          <div className="jyotish-fact-compact">
            <span className="text-[9px] text-[var(--muted-foreground)]">Lagna</span>
            <span className="text-[13px] font-medium text-[var(--foreground)]">{chart.core.lagna_sign}</span>
          </div>
          <div className="jyotish-fact-compact">
            <span className="text-[9px] text-[var(--muted-foreground)]">Moon Sign</span>
            <span className="text-[13px] font-medium text-[var(--foreground)]">{chart.core.moon_sign}</span>
          </div>
          <div className="jyotish-fact-compact">
            <span className="text-[9px] text-[var(--muted-foreground)]">Nakshatra</span>
            <span className="text-[13px] font-medium text-[var(--foreground)]">{chart.core.moon_nakshatra}</span>
          </div>
          <div className="jyotish-fact-compact">
            <span className="text-[9px] text-[var(--muted-foreground)]">Pada</span>
            <span className="text-[13px] font-medium text-[var(--foreground)]">{chart.core.moon_pada}</span>
          </div>
        </div>
      </div>

      {birthTimeConfidence === "approximate" && (
        <div className="text-[10px] text-[var(--muted-foreground)] bg-[var(--border)]/20 rounded-lg px-2.5 py-1.5">
          Birth time is approximate. House placements may shift if time is corrected.
        </div>
      )}

      {/* Planet Workflows — 3-column card grid */}
      <div>
        <div className="flex items-center justify-between mb-[8px]">
          <h4 className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
            Planet Workflows
          </h4>
          <span className="text-[9px] text-[var(--muted-foreground)]">
            Lahiri · Whole Sign · D1
          </span>
        </div>
        <div className="graha-card-grid">
          {PLANET_ORDER.map((key) => {
            const graha = chart.grahas[key];
            if (!graha) return null;
            const planetData = (matrix.planets as Record<string, { title: string }>)[key];
            return (
              <button
                key={key}
                onClick={() => onSelectPlanet(key)}
                className="graha-card-mini"
              >
                <div className="graha-card-mini-icon">
                  {PLANET_SYMBOLS[key]}
                </div>
                <div className="graha-card-mini-body">
                  <span className="text-[11px] font-semibold text-[var(--foreground)] leading-tight">
                    {PLANET_LABELS[key]}
                  </span>
                  <span className="text-[9px] text-[var(--muted-foreground)] leading-tight">
                    {graha.sign} · {graha.house}{ordinal(graha.house)}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Past Life Debt card — inside the grid */}
          <button
            onClick={onSelectKarma}
            className="karma-card-mini"
          >
            <div className="graha-card-mini-icon karma-icon">
              ☾
            </div>
            <div className="graha-card-mini-body">
              <span className="text-[11px] font-semibold text-[var(--foreground)] leading-tight">
                Past Life Debt
              </span>
              <span className="text-[9px] text-[var(--muted-foreground)] leading-tight">
                {chart.core.moon_nakshatra} · Pada {chart.core.moon_pada}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Settings footer */}
      <div className="flex items-center justify-end gap-[8px]">
        <button onClick={onRecalculate} className="text-[10px] text-[var(--primary)] hover:underline">
          Edit
        </button>
        <button onClick={onDeleteProfile} className="text-[10px] text-red-400 hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
