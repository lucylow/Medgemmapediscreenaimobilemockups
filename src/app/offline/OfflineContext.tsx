import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { syncEngine, type SyncState } from "./SyncEngine";
import { getStorageEstimate, getImpactMetrics, getTodayImpactMetric, type ImpactMetric } from "./OfflineDB";
import { useOnlineStatus } from "../platform/useOnlineStatus";

interface OfflineContextType {
  isOnline: boolean;
  syncState: SyncState;
  storageUsage: { usageMB: number; quotaMB: number; percent: number };
  todayMetrics: ImpactMetric;
  allMetrics: ImpactMetric[];
  totalScreened: number;
  totalIdentified: number;
  totalSavings: number;
  refreshMetrics: () => Promise<void>;
  swReady: boolean;
  cachedAssets: number;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus();
  const [syncState, setSyncState] = useState<SyncState>(syncEngine.getState());
  const [storageUsage, setStorageUsage] = useState({ usageMB: 0, quotaMB: 0, percent: 0 });
  const [todayMetrics, setTodayMetrics] = useState<ImpactMetric>({ date: "", childrenScreened: 0, earlyIdentified: 0, estimatedSavings: 0, syncStatus: "local" });
  const [allMetrics, setAllMetrics] = useState<ImpactMetric[]>([]);
  const [swReady, setSwReady] = useState(false);
  const [cachedAssets, setCachedAssets] = useState(0);

  useEffect(() => {
    const unsub = syncEngine.subscribe(setSyncState);
    syncEngine.start();
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(() => setSwReady(true));

      const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === "offlineStats") {
          setCachedAssets((e.data.staticCached || 0) + (e.data.dynamicCached || 0));
        }
      };
      navigator.serviceWorker.addEventListener("message", handleMessage);

      navigator.serviceWorker.ready.then((reg) => {
        reg.active?.postMessage("getOfflineStats");
      });

      return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
    }
  }, []);

  const refreshMetrics = useCallback(async () => {
    try {
      const [storage, today, all] = await Promise.all([
        getStorageEstimate(),
        getTodayImpactMetric(),
        getImpactMetrics(),
      ]);
      setStorageUsage(storage);
      setTodayMetrics(today);
      setAllMetrics(all);
    } catch {}
  }, []);

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  const totalScreened = allMetrics.reduce((s, m) => s + m.childrenScreened, 0);
  const totalIdentified = allMetrics.reduce((s, m) => s + m.earlyIdentified, 0);
  const totalSavings = allMetrics.reduce((s, m) => s + m.estimatedSavings, 0);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        syncState,
        storageUsage,
        todayMetrics,
        allMetrics,
        totalScreened,
        totalIdentified,
        totalSavings,
        refreshMetrics,
        swReady,
        cachedAssets,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error("useOffline must be used within OfflineProvider");
  return ctx;
}
