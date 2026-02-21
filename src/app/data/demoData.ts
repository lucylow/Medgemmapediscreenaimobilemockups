import { Child, ScreeningSession, ScreeningResult, DomainAnswer } from "./types";
import { getQuestionsForAge } from "./questions";
import { evaluateScreening } from "./screeningEngine";
import * as storage from "./storage";

function buildSession(
  childId: string,
  ageMonths: number,
  answerPattern: Record<string, "yes" | "sometimes" | "not_yet">
): { session: ScreeningSession; result: ScreeningResult } {
  const ageBand = getQuestionsForAge(ageMonths);
  const domains: DomainAnswer[] = Object.entries(ageBand.domains).map(([domain, questions]) => ({
    domain: domain as any,
    questions: questions.map((q) => ({
      ...q,
      answer: answerPattern[q.id] || answerPattern["_default"] || "yes",
    })),
  }));

  const session: ScreeningSession = {
    id: `demo-${childId}-${Date.now()}`,
    childId,
    createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    ageMonths,
    domains,
    parentConcernsText: "",
    media: [],
    status: "submitted",
  };

  const result = evaluateScreening(session);
  return { session, result };
}

export function loadDemoData() {
  storage.clearAllData();

  const childA: Child = {
    id: "demo-child-a",
    displayName: "Mia",
    birthDate: new Date(Date.now() - 18 * 30 * 86400000).toISOString().split("T")[0],
    sex: "female",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  };

  const childB: Child = {
    id: "demo-child-b",
    displayName: "James",
    birthDate: new Date(Date.now() - 24 * 30 * 86400000).toISOString().split("T")[0],
    sex: "male",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  };

  const childC: Child = {
    id: "demo-child-c",
    displayName: "Zara",
    birthDate: new Date(Date.now() - 36 * 30 * 86400000).toISOString().split("T")[0],
    sex: "female",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  };

  const childD: Child = {
    id: "demo-child-d",
    displayName: "Leo",
    birthDate: new Date(Date.now() - 24 * 30 * 86400000).toISOString().split("T")[0],
    sex: "male",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  };

  [childA, childB, childC, childD].forEach(storage.saveChild);

  const sessionA = buildSession("demo-child-a", 18, { _default: "yes" });
  storage.saveSession(sessionA.session);
  storage.saveResult(sessionA.result);

  const sessionB = buildSession("demo-child-b", 24, {
    _default: "yes",
    "c01-24": "not_yet",
    "c02-24": "not_yet",
    "c03-24": "sometimes",
    "c04-24": "not_yet",
    "c05-24": "sometimes",
  });
  storage.saveSession(sessionB.session);
  storage.saveResult(sessionB.result);

  const sessionC = buildSession("demo-child-c", 36, {
    _default: "yes",
    "fm01-36": "not_yet",
    "fm02-36": "not_yet",
    "fm03-36": "sometimes",
    "fm04-36": "not_yet",
  });
  storage.saveSession(sessionC.session);
  storage.saveResult(sessionC.result);

  const sessionD = buildSession("demo-child-d", 24, {
    _default: "sometimes",
    "c01-24": "not_yet",
    "c02-24": "not_yet",
    "c03-24": "not_yet",
    "c04-24": "not_yet",
    "c05-24": "not_yet",
    "s01-24": "not_yet",
    "s02-24": "not_yet",
    "s03-24": "sometimes",
    "s04-24": "sometimes",
    "cg01-24": "not_yet",
    "cg02-24": "not_yet",
    "cg03-24": "sometimes",
    "cg04-24": "not_yet",
  });
  storage.saveSession(sessionD.session);
  storage.saveResult(sessionD.result);

  storage.setUserRole("chw");
}
