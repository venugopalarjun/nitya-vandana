import sweph from "sweph";

const c = sweph.constants;

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
  const nakshatraSpan = 360 / 27; // 13.333...
  const nakshatraIndex = Math.floor(normalized / nakshatraSpan);
  const posInNakshatra = normalized - nakshatraIndex * nakshatraSpan;
  const pada = Math.floor(posInNakshatra / (nakshatraSpan / 4)) + 1;
  return { name: NAKSHATRAS[nakshatraIndex], pada };
}

function getHouse(planetDeg: number, lagnaSignIdx: number): number {
  const planetSignIdx = getSignIndex(planetDeg);
  return ((planetSignIdx - lagnaSignIdx + 12) % 12) + 1;
}

export async function POST(request: Request) {
  try {
    const body: BirthInput = await request.json();

    const { birth_date, birth_time, latitude, longitude, timezone_offset } = body;

    // Parse birth date and time
    const [year, month, day] = birth_date.split("-").map(Number);
    const [hour, minute] = birth_time.split(":").map(Number);

    // Convert local time to UTC
    const localDecimalHour = hour + minute / 60;
    const utcDecimalHour = localDecimalHour - timezone_offset;

    // Adjust date if UTC hour crosses midnight
    let utcYear = year;
    let utcMonth = month;
    let utcDay = day;
    let utcHour = utcDecimalHour;

    if (utcHour < 0) {
      utcHour += 24;
      // Go back one day
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

    // Set sidereal mode (Lahiri ayanamsa)
    sweph.set_sid_mode(c.SE_SIDM_LAHIRI, 0, 0);

    // Calculate Julian day
    const jd = sweph.julday(utcYear, utcMonth, utcDay, utcHour, c.SE_GREG_CAL);

    const flags = c.SEFLG_SWIEPH | c.SEFLG_SIDEREAL;

    // Calculate ascendant and houses (W = Whole Sign)
    const housesResult = sweph.houses(jd, latitude, longitude, "W");
    const ascendantDeg = housesResult.data.points[0];
    const lagnaSignIdx = getSignIndex(ascendantDeg);

    // Calculate planet positions
    const planetBodies = [
      { id: c.SE_SUN, key: "sun" },
      { id: c.SE_MOON, key: "moon" },
      { id: c.SE_MARS, key: "mars" },
      { id: c.SE_MERCURY, key: "mercury" },
      { id: c.SE_JUPITER, key: "jupiter" },
      { id: c.SE_VENUS, key: "venus" },
      { id: c.SE_SATURN, key: "saturn" },
      { id: c.SE_MEAN_NODE, key: "rahu" },
    ];

    const grahas: Record<string, {
      sign: string;
      house: number;
      degree: number;
      nakshatra: string;
      pada: number;
    }> = {};

    for (const { id, key } of planetBodies) {
      const result = sweph.calc_ut(jd, id, flags);
      const deg = result.data[0];
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

    // Ketu is 180 degrees from Rahu
    const rahuDeg = sweph.calc_ut(jd, c.SE_MEAN_NODE, flags).data[0];
    const ketuDeg = (rahuDeg + 180) % 360;
    const ketuNak = getNakshatra(ketuDeg);
    grahas.ketu = {
      sign: SIGNS[getSignIndex(ketuDeg)],
      house: getHouse(ketuDeg, lagnaSignIdx),
      degree: Number((((ketuDeg % 30) + 30) % 30).toFixed(2)),
      nakshatra: ketuNak.name,
      pada: ketuNak.pada,
    };

    // Moon nakshatra for chart summary
    const moonDeg = sweph.calc_ut(jd, c.SE_MOON, flags).data[0];
    const moonNak = getNakshatra(moonDeg);

    const chartData = {
      birth: {
        date: birth_date,
        time: birth_time,
        latitude,
        longitude,
        timezone_offset,
      },
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
