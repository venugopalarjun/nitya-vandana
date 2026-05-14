"use client";

import { useState, useEffect } from "react";
import { useJyotishProfile, type ChartData } from "@/hooks/useJyotishProfile";
import { BirthInputForm } from "./BirthInputForm";
import { GrahaCardStrip } from "./GrahaCardStrip";
import { GrahaCardDetail } from "./GrahaCardDetail";
import { ChartSummary } from "./ChartSummary";
import { NakshatraKarma } from "./NakshatraKarma";

type JyotishView = "input" | "summary" | "cards" | "karma";

const PLANET_ORDER = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"] as const;

export function JyotishPanel() {
  const {
    profile,
    hydrated,
    saveProfile,
    saveChart,
    addPractice,
    removePractice,
    deleteProfile,
  } = useJyotishProfile();

  const [view, setView] = useState<JyotishView>("input");
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // After hydration, sync view with profile state
  useEffect(() => {
    if (hydrated && profile?.chart && view === "input") {
      setView("summary");
    }
  }, [hydrated, profile?.chart]);

  async function handleCalculate(data: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    birthTimeConfidence: "exact" | "approximate" | "unknown";
    latitude: number;
    longitude: number;
    timezone: string;
    timezoneOffset: number;
  }) {
    setCalculating(true);
    setError(null);

    try {
      saveProfile({
        birthDate: data.birthDate,
        birthTime: data.birthTime,
        birthPlace: data.birthPlace,
        birthTimeConfidence: data.birthTimeConfidence,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        timezoneOffset: data.timezoneOffset,
      });

      const res = await fetch("/api/calculate-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birth_date: data.birthDate,
          birth_time: data.birthTime,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone_offset: data.timezoneOffset,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Calculation failed");
      }

      const chart: ChartData = await res.json();
      saveChart(chart);
      setView("summary");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCalculating(false);
    }
  }

  function handleSelectPlanet(key: string) {
    setSelectedPlanet(key);
    setView("cards");
  }

  function handleBack() {
    if (view === "cards") {
      setSelectedPlanet(null);
      setView("summary");
    } else if (view === "summary") {
      setView("input");
    }
  }

  function handleDeleteProfile() {
    deleteProfile();
    setView("input");
    setSelectedPlanet(null);
    setError(null);
  }

  function handleNavigatePlanet(direction: "prev" | "next") {
    if (!selectedPlanet) return;
    const idx = PLANET_ORDER.indexOf(selectedPlanet as typeof PLANET_ORDER[number]);
    if (direction === "prev" && idx > 0) {
      setSelectedPlanet(PLANET_ORDER[idx - 1]);
    } else if (direction === "next" && idx < PLANET_ORDER.length - 1) {
      setSelectedPlanet(PLANET_ORDER[idx + 1]);
    }
  }

  if (!hydrated) return null;

  return (
    <div>
      {view === "input" && (
        <BirthInputForm
          onCalculate={handleCalculate}
          calculating={calculating}
          error={error}
          initialData={profile ? {
            birthDate: profile.birthDate,
            birthTime: profile.birthTime,
            birthPlace: profile.birthPlace,
            birthTimeConfidence: profile.birthTimeConfidence,
          } : undefined}
        />
      )}

      {view === "summary" && profile?.chart && (
        <ChartSummary
          chart={profile.chart}
          birthPlace={profile.birthPlace}
          birthTimeConfidence={profile.birthTimeConfidence}
          onSelectPlanet={handleSelectPlanet}
          onSelectKarma={() => setView("karma")}
          onRecalculate={handleBack}
          onDeleteProfile={handleDeleteProfile}
        />
      )}

      {view === "karma" && profile?.chart && (
        <NakshatraKarma
          chart={profile.chart}
          onBack={() => setView("summary")}
        />
      )}

      {view === "cards" && profile?.chart && selectedPlanet && (
        <GrahaCardDetail
          planetKey={selectedPlanet}
          chart={profile.chart}
          addedPractices={profile.addedPractices}
          onAddPractice={addPractice}
          onRemovePractice={removePractice}
          onBack={() => { setSelectedPlanet(null); setView("summary"); }}
          onNavigate={handleNavigatePlanet}
          onSelectPlanet={handleSelectPlanet}
          isFirst={PLANET_ORDER.indexOf(selectedPlanet as typeof PLANET_ORDER[number]) === 0}
          isLast={PLANET_ORDER.indexOf(selectedPlanet as typeof PLANET_ORDER[number]) === PLANET_ORDER.length - 1}
        />
      )}
    </div>
  );
}
