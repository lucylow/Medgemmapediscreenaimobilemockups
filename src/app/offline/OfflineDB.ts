const DB_NAME = "pediscreen-offline";
const DB_VERSION = 1;

export interface SyncQueueItem {
  id: string;
  tableName: string;
  recordId: string;
  operation: "insert" | "update" | "delete";
  payload: string;
  retryCount: number;
  maxRetries: number;
  priority: number;
  createdAt: number;
  nextAttempt: number;
  status: "pending" | "syncing" | "synced" | "failed";
}

export interface ImpactMetric {
  date: string;
  childrenScreened: number;
  earlyIdentified: number;
  estimatedSavings: number;
  syncStatus: "local" | "synced";
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("sync_queue")) {
        const store = db.createObjectStore("sync_queue", { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("priority", "priority", { unique: false });
        store.createIndex("nextAttempt", "nextAttempt", { unique: false });
      }

      if (!db.objectStoreNames.contains("impact_metrics")) {
        db.createObjectStore("impact_metrics", { keyPath: "date" });
      }

      if (!db.objectStoreNames.contains("offline_log")) {
        const logStore = db.createObjectStore("offline_log", { keyPath: "id", autoIncrement: true });
        logStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txPromise<T>(db: IDBDatabase, storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txGetAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addToSyncQueue(item: Omit<SyncQueueItem, "id" | "createdAt" | "nextAttempt" | "retryCount" | "status">): Promise<void> {
  const db = await openDB();
  const entry: SyncQueueItem = {
    ...item,
    id: `${item.tableName}_${item.recordId}_${Date.now()}`,
    createdAt: Date.now(),
    nextAttempt: Date.now(),
    retryCount: 0,
    status: "pending",
  };
  await txPromise(db, "sync_queue", "readwrite", (store) => store.put(entry));
  db.close();
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await openDB();
  const all = await txGetAll<SyncQueueItem>(db, "sync_queue");
  db.close();
  return all.filter((item) => item.status === "pending" || item.status === "syncing");
}

export async function getAllSyncItems(): Promise<SyncQueueItem[]> {
  const db = await openDB();
  const all = await txGetAll<SyncQueueItem>(db, "sync_queue");
  db.close();
  return all;
}

export async function updateSyncItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
  const db = await openDB();
  const existing = await txPromise<SyncQueueItem>(db, "sync_queue", "readonly", (store) => store.get(id));
  if (existing) {
    const updated = { ...existing, ...updates };
    await txPromise(db, "sync_queue", "readwrite", (store) => store.put(updated));
  }
  db.close();
}

export async function clearSyncedItems(): Promise<void> {
  const db = await openDB();
  const all = await txGetAll<SyncQueueItem>(db, "sync_queue");
  const tx = db.transaction("sync_queue", "readwrite");
  const store = tx.objectStore("sync_queue");
  for (const item of all) {
    if (item.status === "synced") {
      store.delete(item.id);
    }
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function saveImpactMetric(metric: ImpactMetric): Promise<void> {
  const db = await openDB();
  await txPromise(db, "impact_metrics", "readwrite", (store) => store.put(metric));
  db.close();
}

export async function getImpactMetrics(): Promise<ImpactMetric[]> {
  const db = await openDB();
  const all = await txGetAll<ImpactMetric>(db, "impact_metrics");
  db.close();
  return all;
}

export async function getTodayImpactMetric(): Promise<ImpactMetric> {
  const today = new Date().toISOString().split("T")[0];
  const db = await openDB();
  const existing = await txPromise<ImpactMetric | undefined>(db, "impact_metrics", "readonly", (store) => store.get(today));
  db.close();
  return existing || { date: today, childrenScreened: 0, earlyIdentified: 0, estimatedSavings: 0, syncStatus: "local" };
}

export async function incrementScreeningMetric(isHighRisk: boolean): Promise<void> {
  const metric = await getTodayImpactMetric();
  metric.childrenScreened += 1;
  if (isHighRisk) {
    metric.earlyIdentified += 1;
    metric.estimatedSavings += 100000;
  }
  await saveImpactMetric(metric);
}

export async function addOfflineLog(action: string, details: string): Promise<void> {
  const db = await openDB();
  await txPromise(db, "offline_log", "readwrite", (store) =>
    store.add({ action, details, timestamp: Date.now(), synced: false })
  );
  db.close();
}

export async function getStorageEstimate(): Promise<{ usageMB: number; quotaMB: number; percent: number }> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const est = await navigator.storage.estimate();
    const usageMB = Math.round((est.usage || 0) / 1024 / 1024 * 10) / 10;
    const quotaMB = Math.round((est.quota || 0) / 1024 / 1024);
    const percent = est.quota ? Math.round(((est.usage || 0) / est.quota) * 100) : 0;
    return { usageMB, quotaMB, percent };
  }
  return { usageMB: 0, quotaMB: 0, percent: 0 };
}
