export interface MockChildProfile {
  name: string;
  sex: "male" | "female";
  language?: string;
  region?: string;
}

export const CHILD_NAMES: MockChildProfile[] = [
  { name: "Mia", sex: "female" },
  { name: "Liam", sex: "male" },
  { name: "Sofia", sex: "female" },
  { name: "Noah", sex: "male" },
  { name: "Zara", sex: "female" },
  { name: "James", sex: "male" },
  { name: "Amara", sex: "female", language: "Swahili", region: "East Africa" },
  { name: "Raj", sex: "male", language: "Hindi", region: "South Asia" },
  { name: "Aisha", sex: "female", language: "Arabic", region: "MENA" },
  { name: "Carlos", sex: "male", language: "Spanish", region: "Latin America" },
  { name: "Yuki", sex: "female", language: "Japanese", region: "East Asia" },
  { name: "Omar", sex: "male", language: "Arabic", region: "MENA" },
  { name: "Priya", sex: "female", language: "Tamil", region: "South Asia" },
  { name: "Lucas", sex: "male" },
  { name: "Fatima", sex: "female", language: "Urdu", region: "South Asia" },
  { name: "Ethan", sex: "male" },
  { name: "Luna", sex: "female" },
  { name: "Leo", sex: "male" },
  { name: "Ava", sex: "female" },
  { name: "Kai", sex: "male" },
  { name: "Isabella", sex: "female" },
  { name: "Mateo", sex: "male", language: "Spanish" },
  { name: "Chloe", sex: "female" },
  { name: "Arjun", sex: "male", language: "Hindi", region: "South Asia" },
  { name: "Layla", sex: "female" },
  { name: "Ben", sex: "male" },
  { name: "Nadia", sex: "female", language: "Arabic" },
  { name: "Daniel", sex: "male" },
  { name: "Sakura", sex: "female", language: "Japanese", region: "East Asia" },
  { name: "Hassan", sex: "male", language: "Arabic", region: "MENA" },
  { name: "Emma", sex: "female" },
  { name: "Gabriel", sex: "male" },
  { name: "Nia", sex: "female" },
  { name: "Oscar", sex: "male" },
  { name: "Maya", sex: "female" },
  { name: "Finn", sex: "male" },
  { name: "Rosa", sex: "female", language: "Spanish", region: "Latin America" },
  { name: "Aiden", sex: "male" },
  { name: "Kira", sex: "female" },
  { name: "Ravi", sex: "male", language: "Hindi" },
  { name: "Elena", sex: "female" },
  { name: "Theo", sex: "male" },
  { name: "Adaeze", sex: "female", language: "Igbo", region: "West Africa" },
  { name: "Kwame", sex: "male", language: "Twi", region: "West Africa" },
  { name: "Suki", sex: "female", language: "Korean", region: "East Asia" },
  { name: "Tariq", sex: "male", language: "Arabic" },
  { name: "Ana", sex: "female" },
  { name: "Ivan", sex: "male" },
  { name: "Mei", sex: "female", language: "Mandarin", region: "East Asia" },
  { name: "Diego", sex: "male", language: "Spanish" },
];

export const CHW_NAMES = [
  "Maria Santos", "Carlos Mendoza", "Aisha Bello", "Raj Patel", "Sofia Chen",
  "Omar Hassan", "Grace Okafor", "Luis Rivera", "Fatima Al-Rashid", "James Kimathi",
  "Priya Sharma", "Elena Vasquez", "Ahmad Khalil", "Blessing Nwankwo", "Mei-Lin Wu",
];

export const CLINIC_LOCATIONS = [
  "Community Health Center", "Mobile Clinic Unit", "Rural Health Post",
  "District Hospital", "Urban Primary Care", "Village Health Center",
  "School-Based Clinic", "Home Visit", "Field Screening Camp",
  "Maternal Child Health Clinic",
];

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function pickWeighted<T>(items: T[], weights: number[], rng: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
