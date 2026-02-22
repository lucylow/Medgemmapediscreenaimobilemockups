import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { WearableMetrics, WearableTrendPoint, WearableSummary, WearableConnectionStatus, WearableDevice } from "./types";
import { generateMockMetrics, generateMockTrend, MOCK_DEVICES } from "./mockWearableData";
import { generateWearableSummary } from "./clinicalEngine";

interface WearableState {
  status: WearableConnectionStatus;
  metrics: WearableMetrics | null;
  trend: WearableTrendPoint[];
  summary: WearableSummary | null;
  devices: WearableDevice[];
  ageMonths: number;
  useMock: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => void;
  setAge: (months: number) => void;
  toggleMock: () => void;
}

const WearableContext = createContext<WearableState>({
  status: "disconnected",
  metrics: null,
  trend: [],
  summary: null,
  devices: [],
  ageMonths: 24,
  useMock: true,
  connect: async () => {},
  disconnect: () => {},
  refresh: () => {},
  setAge: () => {},
  toggleMock: () => {},
});

export function WearableProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WearableConnectionStatus>("disconnected");
  const [metrics, setMetrics] = useState<WearableMetrics | null>(null);
  const [trend, setTrend] = useState<WearableTrendPoint[]>([]);
  const [summary, setSummary] = useState<WearableSummary | null>(null);
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [ageMonths, setAgeMonths] = useState(24);
  const [useMock, setUseMock] = useState(true);

  const fetchData = useCallback(
    (age: number) => {
      const m = generateMockMetrics(age);
      const t = generateMockTrend(age, 7);
      const s = generateWearableSummary(m);
      setMetrics(m);
      setTrend(t);
      setSummary(s);
    },
    []
  );

  const connect = useCallback(async () => {
    setStatus("connecting");

    if (!useMock && "bluetooth" in navigator) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [{ services: ["heart_rate"] }],
          optionalServices: ["battery_service"],
        });
        setDevices([
          {
            id: device.id,
            name: device.name || "BLE Device",
            type: "fitness_band",
            lastSync: new Date().toISOString(),
          },
        ]);
        setStatus("connected");
        fetchData(ageMonths);
        return;
      } catch {
        setStatus("error");
        return;
      }
    }

    await new Promise((r) => setTimeout(r, 1200));
    setDevices(MOCK_DEVICES);
    setStatus("connected");
    fetchData(ageMonths);
  }, [useMock, ageMonths, fetchData]);

  const disconnect = useCallback(() => {
    setStatus("disconnected");
    setMetrics(null);
    setTrend([]);
    setSummary(null);
    setDevices([]);
  }, []);

  const refresh = useCallback(() => {
    if (status === "connected") {
      fetchData(ageMonths);
    }
  }, [status, ageMonths, fetchData]);

  const setAge = useCallback(
    (months: number) => {
      setAgeMonths(months);
      if (status === "connected") {
        fetchData(months);
      }
    },
    [status, fetchData]
  );

  const toggleMock = useCallback(() => {
    setUseMock((prev) => !prev);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("wearable_connected");
    if (saved === "true") {
      connect();
    }
  }, []);

  useEffect(() => {
    if (status === "connected") {
      localStorage.setItem("wearable_connected", "true");
    } else if (status === "disconnected") {
      localStorage.removeItem("wearable_connected");
    }
  }, [status]);

  return (
    <WearableContext.Provider
      value={{ status, metrics, trend, summary, devices, ageMonths, useMock, connect, disconnect, refresh, setAge, toggleMock }}
    >
      {children}
    </WearableContext.Provider>
  );
}

export function useWearable() {
  return useContext(WearableContext);
}
