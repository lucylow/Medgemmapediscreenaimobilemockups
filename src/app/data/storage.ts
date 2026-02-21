import { Child, ScreeningSession, ScreeningResult, UserRole } from "./types";

const KEYS = {
  children: "pediscreen_children",
  sessions: "pediscreen_sessions",
  results: "pediscreen_results",
  role: "pediscreen_role",
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getChildren(): Child[] {
  return getItem<Child[]>(KEYS.children, []);
}

export function saveChild(child: Child): void {
  const children = getChildren();
  const idx = children.findIndex((c) => c.id === child.id);
  if (idx >= 0) {
    children[idx] = child;
  } else {
    children.push(child);
  }
  setItem(KEYS.children, children);
}

export function deleteChild(childId: string): void {
  const children = getChildren().filter((c) => c.id !== childId);
  setItem(KEYS.children, children);
  const sessions = getSessions().filter((s) => s.childId !== childId);
  setItem(KEYS.sessions, sessions);
  const results = getResults().filter((r) => r.childId !== childId);
  setItem(KEYS.results, results);
}

export function getSessions(): ScreeningSession[] {
  return getItem<ScreeningSession[]>(KEYS.sessions, []);
}

export function getSessionsByChild(childId: string): ScreeningSession[] {
  return getSessions().filter((s) => s.childId === childId);
}

export function saveSession(session: ScreeningSession): void {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  setItem(KEYS.sessions, sessions);
}

export function getResults(): ScreeningResult[] {
  return getItem<ScreeningResult[]>(KEYS.results, []);
}

export function getResultsByChild(childId: string): ScreeningResult[] {
  return getResults().filter((r) => r.childId === childId);
}

export function getResultBySession(sessionId: string): ScreeningResult | undefined {
  return getResults().find((r) => r.sessionId === sessionId);
}

export function saveResult(result: ScreeningResult): void {
  const results = getResults();
  const idx = results.findIndex((r) => r.sessionId === result.sessionId);
  if (idx >= 0) {
    results[idx] = result;
  } else {
    results.push(result);
  }
  setItem(KEYS.results, results);
}

export function getUserRole(): UserRole | null {
  return getItem<UserRole | null>(KEYS.role, null);
}

export function setUserRole(role: UserRole): void {
  setItem(KEYS.role, role);
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
