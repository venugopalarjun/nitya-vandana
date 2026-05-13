import { readFileSync } from "fs";
import { join, dirname } from "path";

/* ──────────────────────────────────────────────
 *  Lazy-singleton: load WASM once, reuse across
 *  invocations in the same serverless instance.
 *
 *  Strategy:
 *  - import("sweph-wasm") is visible to Turbopack so
 *    serverExternalPackages includes it in the function
 *  - eval("require") is used only for the deep wasm
 *    subpath that Turbopack can't resolve
 * ────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sw: any = null;

async function getSw() {
  if (_sw) return _sw;

  // This dynamic import is visible to Turbopack — it ensures
  // sweph-wasm gets included via serverExternalPackages.
  const mod = await import("sweph-wasm");
  const SwissEPH = mod.default ?? mod;

  // Use eval("require") only for the deep subpath (wasm factory + binary)
  // that Turbopack can't statically resolve.
  // eslint-disable-next-line no-eval
  const dynamicRequire = eval("require") as NodeRequire;
  const resolvedPath: string = dynamicRequire.resolve("sweph-wasm");
  const wasmDir = join(dirname(resolvedPath), "wasm");
  const wasmBinary = readFileSync(join(wasmDir, "swisseph.wasm"));
  const { default: wasmFactory } = dynamicRequire(join(wasmDir, "swisseph.cjs"));

  const wasmModule = await wasmFactory({ wasmBinary });
  _sw = new SwissEPH(wasmModule);
  return _sw;
}

/* ──────────────────────────────────────────────
 *  Helpers
 * ────────────────────────────────────────────── */

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

interface BirthInput {
  birth_date: string; // "YYYY-MM-DD"
  birth_time: string; // "HH:MM"
  latitude: number;
  longitude: number;
  timezone_offset: number; // offset in hours, e.g. 5.5 for IST
}

function getSignIndex(deg: number): number {
  return Math.floor(((deg % 360) + 360) % 360 / 30);
}

function getNakshatra(deg: number): { name: string; pada: number } {
  const normalized = ((deg % 360) + 360) % 360;
  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(normalized / nakshatraSpan);
  const posInNakshatra = normalized - nakshatraIndex * nakshatraSpan;
  const pada = Math.floor(posInNakshatra / (nakshatraSpan / 4)) + 1;
  return { name: NAKSHATRAS[nakshatraIndex], pada };
}

function getHouse(planetDeg: number, lagnaSignIdx: number): number {
  const planetSignIdx = getSignIndex(planetDeg);
  return ((planetSignIdx - lagnaSignIdx + 12) % 12) + 1;
}

/* ──────────────────────────────────────────────
 *  POST handler
 * ────────────────────────────────────────────── */

export async function POST(request: Request) {
  try {
    const body: BirthInput = await request.json();
    const { birth_date, birth_time, latitude, longitude, timezone_offset } = body;

    const sw = await getSw();

    const [year, month, day] = birth_date.split("-").map(Number);
    const [hour, minute] = birth_time.split(":").map(Number);

    const localDecimalHour = hour + minute / 60;
    const utcDecimalHour = localDecimalHour - timezone_offset;

    let utcYear = year;
    let utcMonth = month;
    let utcDay = day;
    let utcHour = utcDecimalHour;

    if (utcHour < 0) {
      utcHour += 24;
      const d = new Date(year, month - 1, day - 1);
      utcYear = d.getFullYear();
      utcMonth = d.getMonth() + 1;
      utcDay = d.getDate();
    } else if (utcHour >= 24) {
      utcHour -= 24;
      const d = new Date(year, month - 1, day + 1);
      utcYear = d.getFullYear();
      utcMonth = d.getMonth() + 1;
      utcDay = d.getDate();
    }

    sw.swe_set_sid_mode(sw.SE_SIDM_LAHIRI, 0, 0);

    const jd = sw.swe_julday(utcYear, utcMonth, utcDay, utcHour, sw.SE_GREG_CAL);
    const flags = sw.SEFLG_SWIEPH | sw.SEFLG_SIDEREAL;

    // swe_houses_ex with SEFLG_SIDEREAL applies the ayanamsa to the ascendant.
    // Plain swe_houses() returns tropical cusps even after swe_set_sid_mode().
    const housesResult = sw.swe_houses_ex(jd, sw.SEFLG_SIDEREAL, latitude, longitude, "W");
    const ascendantDeg = housesResult.ascmc[0];
    const lagnaSignIdx = getSignIndex(ascendantDeg);

    const planetBodies = [
      { id: sw.SE_SUN, key: "sun" },
      { id: sw.SE_MOON, key: "moon" },
      { id: sw.SE_MARS, key: "mars" },
      { id: sw.SE_MERCURY, key: "mercury" },
      { id: sw.SE_JUPITER, key: "jupiter" },
      { id: sw.SE_VENUS, key: "venus" },
      { id: sw.SE_SATURN, key: "saturn" },
      { id: sw.SE_MEAN_NODE, key: "rahu" },
    ];

    const grahas: Record<string, {
      sign: string;
      house: number;
      degree: number;
      nakshatra: string;
      pada: number;
    }> = {};

    for (const { id, key } of planetBodies) {
      const result = sw.swe_calc_ut(jd, id, flags);
      const deg = result[0];
      const sign = SIGNS[getSignIndex(deg)];
      const house = getHouse(deg, lagnaSignIdx);
      const degInSign = Number((((deg % 30) + 30) % 30).toFixed(2));
      const nak = getNakshatra(deg);

      grahas[key] = {
        sign,
        house,
        degree: degInSign,
        nakshatra: nak.name,
        pada: nak.pada,
      };
    }

    const rahuDeg = sw.swe_calc_ut(jd, sw.SE_MEAN_NODE, flags)[0];
    const ketuDeg = (rahuDeg + 180) % 360;
    const ketuNak = getNakshatra(ketuDeg);
    grahas.ketu = {
      sign: SIGNS[getSignIndex(ketuDeg)],
      house: getHouse(ketuDeg, lagnaSignIdx),
      degree: Number((((ketuDeg % 30) + 30) % 30).toFixed(2)),
      nakshatra: ketuNak.name,
      pada: ketuNak.pada,
    };

    const moonDeg = sw.swe_calc_ut(jd, sw.SE_MOON, flags)[0];
    const moonNak = getNakshatra(moonDeg);

    const chartData = {
      birth: { date: birth_date, time: birth_time, latitude, longitude, timezone_offset },
      settings: {
        system: "vedic",
        zodiac: "sidereal",
        ayanamsa: "lahiri",
        house_system: "whole_sign",
        node_type: "mean",
        chart: "D1",
      },
      core: {
        lagna_sign: SIGNS[lagnaSignIdx],
        lagna_degree: Number((ascendantDeg % 30).toFixed(2)),
        moon_sign: grahas.moon.sign,
        moon_nakshatra: moonNak.name,
        moon_pada: moonNak.pada,
      },
      grahas,
    };

    return Response.json(chartData);
  } catch (err) {
    console.error("Chart calculation error:", err);
    return Response.json(
      { error: "Failed to calculate chart. Please check your birth details." },
      { status: 400 }
    );
  }
}
