import { RiskLevel } from "../data/types";

const VIBRATION_PATTERNS: Record<string, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  warning: [30, 50, 30],
  error: [50, 30, 50, 30, 50],
  selection: 5,
  swipe: 8,
};

const RISK_HAPTICS: Record<RiskLevel, string> = {
  on_track: "success",
  monitor: "medium",
  discuss: "warning",
  refer: "error",
};

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

export function hapticImpact(style: "light" | "medium" | "heavy" = "medium") {
  if (!canVibrate()) return;
  navigator.vibrate(VIBRATION_PATTERNS[style] as number);
}

export function hapticSelection() {
  if (!canVibrate()) return;
  navigator.vibrate(VIBRATION_PATTERNS.selection as number);
}

export function hapticNotification(type: "success" | "warning" | "error") {
  if (!canVibrate()) return;
  navigator.vibrate(VIBRATION_PATTERNS[type] as number[]);
}

export function hapticRiskLevel(risk: RiskLevel) {
  const pattern = RISK_HAPTICS[risk];
  if (pattern === "success" || pattern === "warning" || pattern === "error") {
    hapticNotification(pattern);
  } else {
    hapticImpact(pattern as "light" | "medium" | "heavy");
  }
}

export function hapticSwipe() {
  if (!canVibrate()) return;
  navigator.vibrate(VIBRATION_PATTERNS.swipe as number);
}
