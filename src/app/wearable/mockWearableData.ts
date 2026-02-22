import type { WearableMetrics, WearableTrendPoint, WearableDevice } from "./types";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateMockMetrics(ageMonths: number = 24, seed: number = Date.now()): WearableMetrics {
  const rng = seededRandom(seed);

  const baseHrv = ageMonths < 12 ? 20 : ageMonths < 24 ? 25 : 30;
  const baseSteps = ageMonths < 12 ? 200 : ageMonths < 18 ? 1000 : ageMonths < 36 ? 2500 : 4000;
  const baseSleep = ageMonths < 12 ? 14 : ageMonths < 24 ? 12 : 11;
  const baseFalls = ageMonths < 12 ? 0.5 : ageMonths < 18 ? 2.0 : ageMonths < 36 ? 1.2 : 0.5;

  const concern = rng() < 0.3;

  return {
    hrvRmssd: concern ? 10 + rng() * 8 : baseHrv + rng() * 15,
    stepsPerDay: concern ? baseSteps * 0.3 + rng() * baseSteps * 0.3 : baseSteps + rng() * baseSteps * 0.5,
    sleepHours: concern ? baseSleep - 3 + rng() * 2 : baseSleep - 1 + rng() * 2,
    spo2Average: concern ? 90 + rng() * 5 : 95 + rng() * 3,
    fallEventsPerHour: concern ? baseFalls * 2 + rng() * 2 : baseFalls * 0.5 + rng() * baseFalls * 0.5,
    ageMonths,
    timestamp: new Date().toISOString(),
  };
}

export function generateMockTrend(ageMonths: number = 24, days: number = 7): WearableTrendPoint[] {
  const points: WearableTrendPoint[] = [];
  const now = Date.now();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const m = generateMockMetrics(ageMonths, Math.floor(date.getTime() / 86400000));
    points.push({
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      hrvRmssd: Math.round(m.hrvRmssd),
      stepsPerDay: Math.round(m.stepsPerDay),
      sleepHours: parseFloat(m.sleepHours.toFixed(1)),
      spo2Average: parseFloat(m.spo2Average.toFixed(1)),
      fallEventsPerHour: parseFloat(m.fallEventsPerHour.toFixed(1)),
    });
  }

  return points;
}

export const MOCK_DEVICES: WearableDevice[] = [
  { id: "owlet-001", name: "Owlet Dream Sock", type: "baby_monitor", battery: 72, lastSync: new Date(Date.now() - 300000).toISOString() },
  { id: "fitbit-002", name: "Fitbit Ace 3", type: "fitness_band", battery: 85, lastSync: new Date(Date.now() - 600000).toISOString() },
  { id: "apple-003", name: "Apple Watch SE", type: "smartwatch", battery: 64, lastSync: new Date(Date.now() - 120000).toISOString() },
];
