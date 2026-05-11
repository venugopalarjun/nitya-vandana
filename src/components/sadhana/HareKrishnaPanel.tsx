"use client";

import data from "@/content/hare-krishna.json";
import { TextTriad } from "./TextTriad";

export function HareKrishnaPanel() {
  return (
    <TextTriad
      devanagari={data.devanagari}
      transliteration={data.transliteration}
      meaning={data.meaning}
    />
  );
}
