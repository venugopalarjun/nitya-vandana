"use client";

import { useState, useMemo } from "react";
import cities from "@/content/cities.json";

interface BirthInputFormProps {
  onCalculate: (data: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    birthTimeConfidence: "exact" | "approximate" | "unknown";
    latitude: number;
    longitude: number;
    timezone: string;
    timezoneOffset: number;
  }) => void;
  calculating: boolean;
  error: string | null;
  initialData?: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    birthTimeConfidence: "exact" | "approximate" | "unknown";
  };
}

// Map IANA timezone to approximate UTC offset in hours
const TZ_OFFSETS: Record<string, number> = {
  "Asia/Kolkata": 5.5,
  "America/New_York": -5,
  "America/Chicago": -6,
  "America/Denver": -7,
  "America/Los_Angeles": -8,
  "Europe/London": 0,
  "Asia/Dubai": 4,
  "Asia/Singapore": 8,
  "Australia/Sydney": 11,
  "Australia/Melbourne": 11,
  "Pacific/Auckland": 13,
  "Africa/Johannesburg": 2,
  "Africa/Nairobi": 3,
  "Asia/Muscat": 4,
  "Asia/Qatar": 3,
  "Asia/Kuala_Lumpur": 8,
  "America/Toronto": -5,
  "America/Vancouver": -8,
};

interface City {
  name: string;
  state?: string;
  lat: number;
  lng: number;
  tz: string;
}

export function BirthInputForm({
  onCalculate,
  calculating,
  error,
  initialData,
}: BirthInputFormProps) {
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || "");
  const [birthTime, setBirthTime] = useState(initialData?.birthTime || "");
  const [placeQuery, setPlaceQuery] = useState(initialData?.birthPlace || "");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [confidence, setConfidence] = useState<"exact" | "approximate" | "unknown">(
    initialData?.birthTimeConfidence || "exact"
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(() => {
    if (placeQuery.length < 2) return [];
    const q = placeQuery.toLowerCase();
    return (cities as City[])
      .filter((c) => c.name.toLowerCase().includes(q) || (c.state && c.state.toLowerCase().includes(q)))
      .slice(0, 12);
  }, [placeQuery]);

  function handleSelectCity(city: City) {
    setSelectedCity(city);
    setPlaceQuery(city.state ? `${city.name}, ${city.state}` : city.name);
    setShowDropdown(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCity || !birthDate || !birthTime) return;

    const offset = TZ_OFFSETS[selectedCity.tz] ?? 5.5;

    onCalculate({
      birthDate,
      birthTime,
      birthPlace: placeQuery,
      birthTimeConfidence: confidence,
      latitude: selectedCity.lat,
      longitude: selectedCity.lng,
      timezone: selectedCity.tz,
      timezoneOffset: offset,
    });
  }

  const canSubmit = birthDate && birthTime && selectedCity && !calculating;

  return (
    <form onSubmit={handleSubmit} className="grid gap-[16px]">
      <div className="text-center mb-2">
        <p className="text-sm text-[var(--muted-foreground)]">
          Enter your birth details to generate your personal graha cards.
        </p>
      </div>

      {/* Birth Date */}
      <div className="grid gap-[6px]">
        <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
          Date of Birth
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="jyotish-input"
          required
        />
      </div>

      {/* Birth Time */}
      <div className="grid gap-[6px]">
        <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
          Time of Birth
        </label>
        <input
          type="time"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          className="jyotish-input"
          required
        />
        <div className="flex gap-[8px] mt-1">
          {(["exact", "approximate", "unknown"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setConfidence(c)}
              className={`text-xs px-[10px] py-[4px] rounded-full border transition-colors ${
                confidence === c
                  ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              {c === "exact" ? "Exact" : c === "approximate" ? "Approx" : "Unknown"}
            </button>
          ))}
        </div>
      </div>

      {/* Birth Place */}
      <div className="grid gap-[6px] relative">
        <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
          Place of Birth
        </label>
        <input
          type="text"
          value={placeQuery}
          onChange={(e) => {
            setPlaceQuery(e.target.value);
            setSelectedCity(null);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Start typing a city name..."
          className="jyotish-input"
          autoComplete="off"
          required
        />
        {showDropdown && filtered.length > 0 && (
          <ul className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[200px] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--card-bg)] shadow-lg">
            {filtered.map((city, i) => (
              <li key={`${city.name}-${city.state}-${i}`}>
                <button
                  type="button"
                  className="w-full text-left px-[12px] py-[8px] text-sm text-[var(--foreground)] hover:bg-[var(--primary)]/10 transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectCity(city)}
                >
                  {city.name}
                  {city.state && (
                    <span className="text-[var(--muted-foreground)] ml-1">
                      {city.state}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {confidence === "unknown" && (
        <div className="text-xs text-[var(--muted-foreground)] bg-[var(--border)]/20 rounded-lg p-3">
          Without exact birth time, house-based planet cards cannot be generated with confidence.
          Planet sign themes will still be available.
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn btn-primary w-full justify-center"
      >
        {calculating ? "Calculating..." : "Generate Chart"}
      </button>

      <p className="text-[10px] text-[var(--muted-foreground)] text-center">
        Your birth details are stored locally on this device. You can delete them anytime.
      </p>
    </form>
  );
}
