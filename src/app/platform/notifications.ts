export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export function scheduleFollowUpReminder(childName: string, delayMs: number = 5000) {
  if (Notification.permission !== "granted") return null;
  const timeoutId = setTimeout(() => {
    new Notification("PediScreen AI - Follow-up Reminder", {
      body: `Time to check in on ${childName}'s developmental progress. Consider running a new screening.`,
      icon: "/pwa-icon-192.png",
      badge: "/pwa-icon-192.png",
      tag: `followup-${childName}`,
      requireInteraction: false,
    });
  }, delayMs);
  return timeoutId;
}

export function sendRiskAlert(childName: string, riskLevel: string) {
  if (Notification.permission !== "granted") return;
  const urgency: Record<string, string> = {
    refer: "Action needed",
    discuss: "Worth discussing",
    monitor: "Keep watching",
    on_track: "Looking good",
  };
  new Notification(`PediScreen AI - ${urgency[riskLevel] || "Update"}`, {
    body: `${childName}'s screening is complete. Result: ${riskLevel.replace("_", " ").toUpperCase()}`,
    icon: "/pwa-icon-192.png",
    tag: `risk-${childName}`,
  });
}
