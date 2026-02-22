import { ScreeningSession, DomainType, AnswerValue } from "../data/types";
import { StructuredFeatures } from "./inferenceSchemas";

function scoreAnswer(answer: AnswerValue | null): number {
  switch (answer) {
    case "yes": return 1.0;
    case "sometimes": return 0.5;
    case "not_yet": return 0.0;
    default: return 0.5;
  }
}

export function encodeFeaturesForModel(session: ScreeningSession): StructuredFeatures {
  const domainScores: Record<string, number> = {};

  const allDomains: DomainType[] = ["communication", "gross_motor", "fine_motor", "social", "cognitive"];

  for (const domain of allDomains) {
    const da = session.domains.find((d) => d.domain === domain);
    if (da && da.questions.length > 0) {
      const total = da.questions.reduce((sum, q) => sum + scoreAnswer(q.answer), 0);
      domainScores[domain] = total / da.questions.length;
    } else {
      domainScores[domain] = 0.5;
    }
  }

  const totalQuestions = session.domains.reduce((s, d) => s + d.questions.length, 0);
  const totalAnswered = session.domains.reduce(
    (s, d) => s + d.questions.filter((q) => q.answer !== null).length,
    0
  );

  return {
    ageMonths: session.ageMonths,
    domainScores: domainScores as Record<DomainType, number>,
    concernsLength: session.parentConcernsText.length,
    mediaCount: session.media.length,
    totalQuestions,
    totalAnswered,
  };
}

export function featuresToFloat32Array(features: StructuredFeatures): Float32Array {
  const domains: DomainType[] = ["communication", "gross_motor", "fine_motor", "social", "cognitive"];
  const arr = new Float32Array(8);
  arr[0] = features.ageMonths / 72;
  for (let i = 0; i < domains.length; i++) {
    arr[i + 1] = features.domainScores[domains[i]];
  }
  arr[6] = features.totalAnswered / Math.max(features.totalQuestions, 1);
  arr[7] = Math.min(features.concernsLength / 500, 1.0);
  return arr;
}
