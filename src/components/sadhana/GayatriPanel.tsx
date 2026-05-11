"use client";

import gayatriData from "@/content/gayatri.json";
import { TextTriad } from "./TextTriad";

export function GayatriPanel() {
  return (
    <TextTriad
      devanagari={gayatriData.devanagari}
      transliteration={gayatriData.transliteration}
      meaning={gayatriData.meaning}
    />
  );
}
