import { getPendingSyncItems, updateSyncItem, clearSyncedItems, addOfflineLog, addToSyncQueue, type SyncQueueItem } from "./OfflineDB";

export type SyncStatus = "idle" | "syncing" | "offline" | "error";

export interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  lastSyncAt: number | null;
  progress: number;
}

type SyncListener = (state: SyncState) => void;

const RETRY_DELAYS = [5000, 30000, 300000, 3600000, 86400000];

class SyncEngine {
  private static instance: SyncEngine;
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;
  private intervalId: number | null = null;
  private state: SyncState = {
    status: "idle",
    pendingCount: 0,
    syncedCount: 0,
    failedCount: 0,
    lastSyncAt: null,
    progress: 0,
  };

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((fn) => fn({ ...this.state }));
  }

  async start() {
    await this.refreshCounts();

    window.addEventListener("online", () => this.onOnline());
    window.addEventListener("offline", () => this.onOffline());

    if (!navigator.onLine) {
      this.state.status = "offline";
      this.emit();
    }

    this.intervalId = window.setInterval(() => this.tick(), 10000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async onOnline() {
    this.state.status = "idle";
    this.emit();
    await addOfflineLog("connectivity", "Back online");
    await this.processSyncQueue();
  }

  private onOffline() {
    this.state.status = "offline";
    this.emit();
    addOfflineLog("connectivity", "Gone offline");
  }

  private async tick() {
    await this.refreshCounts();
    if (navigator.onLine && this.state.pendingCount > 0 && !this.isSyncing) {
      await this.processSyncQueue();
    }
  }

  async refreshCounts() {
    try {
      const items = await getPendingSyncItems();
      this.state.pendingCount = items.filter((i) => i.status === "pending").length;
    } catch {
      this.state.pendingCount = 0;
    }
    this.emit();
  }

  async queueForSync(tableName: string, recordId: string, operation: "insert" | "update" | "delete", payload: any, priority: number = 3) {
    await addToSyncQueue({
      tableName,
      recordId,
      operation,
      payload: JSON.stringify(payload),
      maxRetries: 5,
      priority,
    });
    await this.refreshCounts();
    await addOfflineLog("queue", `Queued ${operation} for ${tableName}/${recordId}`);
  }

  private async processSyncQueue() {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;
    this.state.status = "syncing";
    this.emit();

    try {
      const items = await getPendingSyncItems();
      const sorted = items
        .filter((i) => i.status === "pending" && i.nextAttempt <= Date.now())
        .sort((a, b) => a.priority - b.priority);

      const total = sorted.length;
      let processed = 0;

      for (const item of sorted) {
        try {
          await this.executeSync(item);
          await updateSyncItem(item.id, { status: "synced", retryCount: item.retryCount });
          this.state.syncedCount++;
          processed++;
          this.state.progress = total > 0 ? Math.round((processed / total) * 100) : 0;
          this.emit();
        } catch {
          const newRetry = item.retryCount + 1;
          const delay = RETRY_DELAYS[Math.min(newRetry, RETRY_DELAYS.length - 1)];
          await updateSyncItem(item.id, {
            retryCount: newRetry,
            nextAttempt: Date.now() + delay,
            status: newRetry >= item.maxRetries ? "failed" : "pending",
          });
          if (newRetry >= item.maxRetries) {
            this.state.failedCount++;
          }
        }
      }

      await clearSyncedItems();
    } catch {
      this.state.status = "error";
    } finally {
      this.isSyncing = false;
      this.state.status = navigator.onLine ? "idle" : "offline";
      this.state.progress = 0;
      await this.refreshCounts();
    }
  }

  private async executeSync(item: SyncQueueItem): Promise<void> {
    await addOfflineLog("sync", `Synced ${item.tableName}/${item.recordId} locally`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  getState(): SyncState {
    return { ...this.state };
  }
}

export const syncEngine = SyncEngine.getInstance();
