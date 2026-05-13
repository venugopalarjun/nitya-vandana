"use client";

import { useLocalStorage } from "./useLocalStorage";

export interface GrahaData {
  sign: string;
  house: number;
  degree: number;
  nakshatra: string;
  pada: number;
}

export interface ChartData {
  birth: {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone_offset: number;
  };
  settings: {
    system: string;
    zodiac: string;
    ayanamsa: string;
    house_system: string;
    node_type: string;
    chart: string;
  };
  core: {
    lagna_sign: string;
    lagna_degree: number;
    moon_sign: string;
    moon_nakshatra: string;
    moon_pada: number;
  };
  grahas: Record<string, GrahaData>;
}

export interface JyotishProfile {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  birthTimeConfidence: "exact" | "approximate" | "unknown";
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneOffset: number;
  chart: ChartData | null;
  addedPractices: string[]; // planet keys whose practices user added
}

const EMPTY_PROFILE: JyotishProfile = {
  birthDate: "",
  birthTime: "",
  birthPlace: "",
  birthTimeConfidence: "exact",
  latitude: 0,
  longitude: 0,
  timezone: "",
  timezoneOffset: 0,
  chart: null,
  addedPractices: [],
};

export function useJyotishProfile() {
  const [profile, setProfile, hydrated] = useLocalStorage<JyotishProfile | null>(
    "nitya-jyotish-profile",
    null
  );

  function saveProfile(data: Partial<JyotishProfile>) {
    setProfile((prev) => ({
      ...(prev || EMPTY_PROFILE),
      ...data,
    }));
  }

  function saveChart(chart: ChartData) {
    setProfile((prev) => ({
      ...(prev || EMPTY_PROFILE),
      chart,
    }));
  }

  function addPractice(planetKey: string) {
    setProfile((prev) => {
      if (!prev) return prev;
      if (prev.addedPractices.includes(planetKey)) return prev;
      return { ...prev, addedPractices: [...prev.addedPractices, planetKey] };
    });
  }

  function removePractice(planetKey: string) {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        addedPractices: prev.addedPractices.filter((k) => k !== planetKey),
      };
    });
  }

  function deleteProfile() {
    setProfile(null);
  }

  return {
    profile,
    hydrated,
    saveProfile,
    saveChart,
    addPractice,
    removePractice,
    deleteProfile,
  };
}
