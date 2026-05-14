"use client";

import type { ChartData } from "@/hooks/useJyotishProfile";
import karmaData from "@/content/nakshatra-karma.json";

interface NakshatraKarmaProps {
  chart: ChartData;
  onBack: () => void;
}

type NakshatraEntry = {
  ruler: string;
  deity: string;
  symbol: string;
  classicalAnchor: string;
  psychologicalExpression: string;
  shadowExpression: string;
  karmicInterpretation: string;
  career: string[];
  health: string[];
  remedy: string[];
  higherExpression: string;
};

export function NakshatraKarma({ chart, onBack }: NakshatraKarmaProps) {
  const nakshatra = chart.core.moon_nakshatra;
  const entry = (karmaData.nakshatras as Record<string, NakshatraEntry>)[nakshatra];

  if (!entry) {
    return (
      <div className="grid gap-[14px]">
        <button onClick={onBack} className="graha-back-btn">
          <span className="text-[14px]">←</span>
          <span>Back to Chart</span>
        </button>
        <div className="graha-card">
          <p className="text-[13px] text-[var(--muted-foreground)]">
            Nakshatra karma data not available for {nakshatra}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-[14px]">
      <button onClick={onBack} className="graha-back-btn">
        <span className="text-[14px]">←</span>
        <span>Back to Chart</span>
      </button>

      {/* Card */}
      <div className="graha-card">
        {/* Header */}
        <div className="mb-[14px]">
          <div className="eyebrow mb-1">Nakshatra Curriculum</div>
          <h3 className="text-[18px] font-semibold text-[var(--foreground)] tracking-tight">
            Moon in {nakshatra}
          </h3>
          <div className="flex flex-wrap gap-[8px] mt-2">
            <span className="karma-tag">{entry.ruler}</span>
            <span className="karma-tag">{entry.deity}</span>
            <span className="karma-tag">{entry.symbol}</span>
          </div>
        </div>

        {/* Classical Anchor */}
        <section className="graha-section">
          <h4 className="graha-section-title">Classical Anchor</h4>
          <p className="text-[13px] text-[var(--foreground)] leading-relaxed">
            {entry.classicalAnchor}
          </p>
        </section>

        {/* Psychological Expression */}
        <section className="graha-section">
          <h4 className="graha-section-title">Psychological Expression</h4>
          <p className="text-[13px] text-[var(--foreground)] leading-relaxed">
            {entry.psychologicalExpression}
          </p>
        </section>

        {/* Shadow + Karmic side by side */}
        <div className="grid grid-cols-2 gap-[10px] max-[480px]:grid-cols-1">
          <section className="graha-section">
            <h4 className="graha-section-title text-[var(--accent)]">Shadow Expression</h4>
            <p className="text-[12px] text-[var(--foreground)] leading-relaxed">
              {entry.shadowExpression}
            </p>
          </section>
          <section className="graha-section">
            <h4 className="graha-section-title text-[var(--primary)]">Karmic Lesson</h4>
            <p className="text-[12px] text-[var(--foreground)] leading-relaxed">
              {entry.karmicInterpretation}
            </p>
          </section>
        </div>

        {/* Career + Health side by side */}
        <div className="grid grid-cols-2 gap-[10px] max-[480px]:grid-cols-1">
          <section className="graha-section">
            <h4 className="graha-section-title">Career Pull</h4>
            <p className="text-[12px] text-[var(--foreground)] leading-relaxed">
              {entry.career.join(", ")}
            </p>
          </section>
          <section className="graha-section">
            <h4 className="graha-section-title">Health Tendency</h4>
            <p className="text-[12px] text-[var(--foreground)] leading-relaxed">
              {entry.health.join(", ")}
            </p>
          </section>
        </div>

        {/* Remedy */}
        <section className="graha-section">
          <h4 className="graha-section-title text-[var(--color-tulsi)]">Remedial Practices</h4>
          <ul className="grid gap-[4px]">
            {entry.remedy.map((r, i) => (
              <li key={i} className="text-[13px] text-[var(--foreground)] flex items-start gap-[6px]">
                <span className="text-[var(--primary)] mt-[2px]">·</span>
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* Higher Expression */}
        <section className="graha-section graha-reflection">
          <h4 className="graha-section-title">Higher Expression</h4>
          <p className="text-[14px] text-[var(--foreground)] italic leading-relaxed">
            {entry.higherExpression}
          </p>
        </section>
      </div>

      {/* Attribution */}
      <p className="text-[9px] text-[var(--muted-foreground)] text-center">
        Moon · {nakshatra} · Pada {chart.core.moon_pada} · {chart.core.moon_sign} · Classical lens: Brihat Samhita
      </p>
    </div>
  );
}
