"use client";

interface TextTriadProps {
  devanagari: string;
  transliteration: string;
  meaning: string;
}

export function TextTriad({ devanagari, transliteration, meaning }: TextTriadProps) {
  return (
    <div className="grid gap-[22px]">
      <div className="devanagari-text whitespace-pre-line">{devanagari}</div>

      <div className="flute-divider" aria-hidden="true">
        <div className="flute-line" />
        <span className="flute-hole" />
        <span className="flute-hole" />
        <span className="flute-hole" />
      </div>

      <div className="translit-text whitespace-pre-line">{transliteration}</div>

      <div className="meaning-text whitespace-pre-line">{meaning}</div>
    </div>
  );
}
