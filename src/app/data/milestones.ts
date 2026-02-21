export type MilestoneDomain = "communication" | "motor" | "social" | "cognitive";

export interface Milestone {
  id: string;
  domain: MilestoneDomain;
  question: string;
  ageRange: [number, number];
}

export const MILESTONE_DOMAIN_META: Record<MilestoneDomain, { label: string; icon: string; color: string }> = {
  communication: { label: "Communication", icon: "💬", color: "#1A73E8" },
  motor: { label: "Motor Skills", icon: "🏃", color: "#34A853" },
  social: { label: "Social-Emotional", icon: "👫", color: "#EA4335" },
  cognitive: { label: "Problem Solving", icon: "🧠", color: "#9C27B0" },
};

const milestones: Milestone[] = [
  { id: "c01", domain: "communication", question: "Turns toward sounds and voices", ageRange: [0, 11] },
  { id: "c02", domain: "communication", question: "Babbles using consonant sounds (ba, da, ga)", ageRange: [0, 11] },
  { id: "c03", domain: "communication", question: "Responds to their own name", ageRange: [0, 11] },
  { id: "c04", domain: "communication", question: "Understands 'no' or 'stop'", ageRange: [0, 11] },

  { id: "c05", domain: "communication", question: "Says 2–6 single words consistently", ageRange: [12, 17] },
  { id: "c06", domain: "communication", question: "Points to things they want", ageRange: [12, 17] },
  { id: "c07", domain: "communication", question: "Follows simple instructions (e.g., 'give me the ball')", ageRange: [12, 17] },
  { id: "c08", domain: "communication", question: "Waves 'bye-bye' or shakes head for 'no'", ageRange: [12, 17] },

  { id: "c09", domain: "communication", question: "Says 10–50 words consistently", ageRange: [18, 23] },
  { id: "c10", domain: "communication", question: "Combines 2 words together (e.g., 'want milk')", ageRange: [18, 23] },
  { id: "c11", domain: "communication", question: "Points to body parts when asked", ageRange: [18, 23] },
  { id: "c12", domain: "communication", question: "Tries to say words you say", ageRange: [18, 23] },

  { id: "c13", domain: "communication", question: "Uses 50+ words and short sentences", ageRange: [24, 35] },
  { id: "c14", domain: "communication", question: "Strangers can understand about half of what child says", ageRange: [24, 35] },
  { id: "c15", domain: "communication", question: "Asks 'what' and 'where' questions", ageRange: [24, 35] },
  { id: "c16", domain: "communication", question: "Names objects in pictures", ageRange: [24, 35] },

  { id: "c17", domain: "communication", question: "Uses sentences of 4+ words", ageRange: [36, 60] },
  { id: "c18", domain: "communication", question: "Tells you what happened during the day", ageRange: [36, 60] },
  { id: "c19", domain: "communication", question: "Answers 'who', 'what', 'where' questions", ageRange: [36, 60] },
  { id: "c20", domain: "communication", question: "Most speech is understandable to strangers", ageRange: [36, 60] },

  { id: "m01", domain: "motor", question: "Holds head up when on tummy", ageRange: [0, 11] },
  { id: "m02", domain: "motor", question: "Rolls over in both directions", ageRange: [0, 11] },
  { id: "m03", domain: "motor", question: "Sits without support", ageRange: [0, 11] },
  { id: "m04", domain: "motor", question: "Picks up small objects with thumb and finger", ageRange: [0, 11] },

  { id: "m05", domain: "motor", question: "Walks alone steadily", ageRange: [12, 17] },
  { id: "m06", domain: "motor", question: "Stacks 2–3 blocks", ageRange: [12, 17] },
  { id: "m07", domain: "motor", question: "Holds a crayon and scribbles", ageRange: [12, 17] },
  { id: "m08", domain: "motor", question: "Bends over and picks up objects", ageRange: [12, 17] },

  { id: "m09", domain: "motor", question: "Kicks a ball forward", ageRange: [18, 23] },
  { id: "m10", domain: "motor", question: "Walks up stairs with help", ageRange: [18, 23] },
  { id: "m11", domain: "motor", question: "Stacks 4+ blocks", ageRange: [18, 23] },
  { id: "m12", domain: "motor", question: "Turns pages of a book", ageRange: [18, 23] },

  { id: "m13", domain: "motor", question: "Runs smoothly without frequent falls", ageRange: [24, 35] },
  { id: "m14", domain: "motor", question: "Jumps with both feet off the ground", ageRange: [24, 35] },
  { id: "m15", domain: "motor", question: "Draws lines and simple circles", ageRange: [24, 35] },
  { id: "m16", domain: "motor", question: "Uses a fork or spoon with minimal spilling", ageRange: [24, 35] },

  { id: "m17", domain: "motor", question: "Hops on one foot", ageRange: [36, 60] },
  { id: "m18", domain: "motor", question: "Catches a large ball most of the time", ageRange: [36, 60] },
  { id: "m19", domain: "motor", question: "Draws a person with 3+ body parts", ageRange: [36, 60] },
  { id: "m20", domain: "motor", question: "Uses scissors to cut along a line", ageRange: [36, 60] },

  { id: "s01", domain: "social", question: "Smiles at familiar people", ageRange: [0, 11] },
  { id: "s02", domain: "social", question: "Looks at you when you talk or play", ageRange: [0, 11] },
  { id: "s03", domain: "social", question: "Shows stranger anxiety (shy with new people)", ageRange: [0, 11] },
  { id: "s04", domain: "social", question: "Plays peek-a-boo and responds to social games", ageRange: [0, 11] },

  { id: "s05", domain: "social", question: "Gives objects to others as part of play", ageRange: [12, 17] },
  { id: "s06", domain: "social", question: "Shows affection to familiar people", ageRange: [12, 17] },
  { id: "s07", domain: "social", question: "Points to show interest (joint attention)", ageRange: [12, 17] },
  { id: "s08", domain: "social", question: "Claps when excited", ageRange: [12, 17] },

  { id: "s09", domain: "social", question: "Engages in simple pretend play (feeds doll)", ageRange: [18, 23] },
  { id: "s10", domain: "social", question: "Shows you something interesting by pointing", ageRange: [18, 23] },
  { id: "s11", domain: "social", question: "Looks at your face to check your reaction", ageRange: [18, 23] },
  { id: "s12", domain: "social", question: "Plays alongside other children", ageRange: [18, 23] },

  { id: "s13", domain: "social", question: "Takes turns with other children", ageRange: [24, 35] },
  { id: "s14", domain: "social", question: "Shows concern when others are upset", ageRange: [24, 35] },
  { id: "s15", domain: "social", question: "Plays make-believe with dolls, animals, people", ageRange: [24, 35] },
  { id: "s16", domain: "social", question: "Separates from parent without much distress", ageRange: [24, 35] },

  { id: "s17", domain: "social", question: "Plays cooperatively with other children", ageRange: [36, 60] },
  { id: "s18", domain: "social", question: "Talks about own feelings (happy, sad, scared)", ageRange: [36, 60] },
  { id: "s19", domain: "social", question: "Follows rules in group games", ageRange: [36, 60] },
  { id: "s20", domain: "social", question: "Shows empathy for friends", ageRange: [36, 60] },

  { id: "g01", domain: "cognitive", question: "Looks at objects and tracks them with eyes", ageRange: [0, 11] },
  { id: "g02", domain: "cognitive", question: "Explores objects by shaking, banging, mouthing", ageRange: [0, 11] },
  { id: "g03", domain: "cognitive", question: "Finds hidden objects (object permanence)", ageRange: [0, 11] },
  { id: "g04", domain: "cognitive", question: "Bangs two objects together", ageRange: [0, 11] },

  { id: "g05", domain: "cognitive", question: "Puts objects in and out of a container", ageRange: [12, 17] },
  { id: "g06", domain: "cognitive", question: "Pokes, turns, and twists objects to explore", ageRange: [12, 17] },
  { id: "g07", domain: "cognitive", question: "Imitates actions (stirs with spoon, talks on phone)", ageRange: [12, 17] },
  { id: "g08", domain: "cognitive", question: "Uses one object to get another (pulls string toy)", ageRange: [12, 17] },

  { id: "g09", domain: "cognitive", question: "Matches shapes or objects that are the same", ageRange: [18, 23] },
  { id: "g10", domain: "cognitive", question: "Completes simple puzzles (2–3 pieces)", ageRange: [18, 23] },
  { id: "g11", domain: "cognitive", question: "Points to pictures in a book when named", ageRange: [18, 23] },
  { id: "g12", domain: "cognitive", question: "Sorts objects by shape or color", ageRange: [18, 23] },

  { id: "g13", domain: "cognitive", question: "Understands 'one' and 'two'", ageRange: [24, 35] },
  { id: "g14", domain: "cognitive", question: "Completes 3–4 piece puzzles", ageRange: [24, 35] },
  { id: "g15", domain: "cognitive", question: "Knows what everyday objects are used for", ageRange: [24, 35] },
  { id: "g16", domain: "cognitive", question: "Names some colors correctly", ageRange: [24, 35] },

  { id: "g17", domain: "cognitive", question: "Counts to 10 and understands quantity", ageRange: [36, 60] },
  { id: "g18", domain: "cognitive", question: "Understands 'same' and 'different'", ageRange: [36, 60] },
  { id: "g19", domain: "cognitive", question: "Draws shapes (circle, square)", ageRange: [36, 60] },
  { id: "g20", domain: "cognitive", question: "Retells a simple story in order", ageRange: [36, 60] },
];

export function getMilestonesForAge(ageMonths: number, domain?: MilestoneDomain): Milestone[] {
  return milestones.filter((m) => {
    const inRange = ageMonths >= m.ageRange[0] && ageMonths <= m.ageRange[1];
    if (domain) return inRange && m.domain === domain;
    return inRange;
  });
}

export function getAgeBandLabel(ageMonths: number): string {
  if (ageMonths <= 11) return "0–11 months";
  if (ageMonths <= 17) return "12–17 months";
  if (ageMonths <= 23) return "18–23 months";
  if (ageMonths <= 35) return "24–35 months";
  return "36–60 months";
}
