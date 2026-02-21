import type { Child, ScreeningResult, RiskLevel } from "../data/types";

export interface PediScreenQR {
  protocol: string;
  version: string;
  type: "patient" | "screening";
  data: Record<string, unknown>;
  created: string;
}

export function encodeChildQR(child: Child): string {
  const payload: PediScreenQR = {
    protocol: "pediscreen",
    version: "2.1",
    type: "patient",
    data: {
      id: child.id,
      name: child.displayName,
      dob: child.birthDate,
      sex: child.sex || "not_specified",
      lang: child.primaryLanguage || "en",
    },
    created: new Date().toISOString(),
  };
  return JSON.stringify(payload);
}

export function encodeScreeningQR(result: ScreeningResult, childName: string): string {
  const payload: PediScreenQR = {
    protocol: "pediscreen",
    version: "2.1",
    type: "screening",
    data: {
      sessionId: result.sessionId,
      childId: result.childId,
      childName,
      ageMonths: result.ageMonths,
      overallRisk: result.overallRisk,
      domains: result.domainRisks.map((d) => ({
        domain: d.domain,
        risk: d.risk,
        score: d.score,
        maxScore: d.maxScore,
      })),
      date: result.createdAt,
      model: result.modelProvenance.modelId,
    },
    created: new Date().toISOString(),
  };
  return JSON.stringify(payload);
}

export function decodeQR(raw: string): PediScreenQR | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.protocol === "pediscreen" && parsed.type && parsed.data) {
      return parsed as PediScreenQR;
    }
    return null;
  } catch {
    return null;
  }
}

export function getChildFromQR(qr: PediScreenQR): Partial<Child> | null {
  if (qr.type !== "patient") return null;
  return {
    id: qr.data.id as string,
    displayName: qr.data.name as string,
    birthDate: qr.data.dob as string,
    sex: qr.data.sex as Child["sex"],
    primaryLanguage: qr.data.lang as string,
  };
}

export function getRiskColor(risk: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    on_track: "#34A853",
    monitor: "#FBBC05",
    discuss: "#FF9800",
    refer: "#EA4335",
  };
  return colors[risk];
}
