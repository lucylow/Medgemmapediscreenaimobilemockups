import { useOffline } from "../offline/OfflineContext";
import { WifiOff, Wifi, CloudOff, RefreshCw, Database } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function OfflineBanner() {
  const { isOnline, syncState, storageUsage } = useOffline();

  const showBanner = !isOnline || syncState.pendingCount > 0 || syncState.status === "syncing";

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden"
      >
        {!isOnline ? (
          <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.15))", borderBottom: "1px solid rgba(245,158,11,0.3)" }} className="text-[#FACC15] px-4 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudOff className="w-4 h-4" />
                <span className="text-sm font-semibold">Offline Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                <span className="text-xs">{storageUsage.usageMB}MB</span>
              </div>
            </div>
            <p className="text-xs text-[#FACC15]/70 mt-0.5">
              Full functionality available
              {syncState.pendingCount > 0 && ` · ${syncState.pendingCount} pending sync`}
            </p>
          </div>
        ) : syncState.status === "syncing" ? (
          <div style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(14,165,233,0.1))", borderBottom: "1px solid rgba(56,189,248,0.3)" }} className="text-[#38BDF8] px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm font-semibold">Syncing...</span>
              </div>
              <span className="text-xs">{syncState.progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1 mt-1.5">
              <motion.div
                className="bg-[#38BDF8] rounded-full h-1"
                initial={{ width: 0 }}
                animate={{ width: `${syncState.progress}%` }}
              />
            </div>
          </div>
        ) : syncState.pendingCount > 0 ? (
          <div style={{ background: "rgba(34,197,94,0.1)", borderBottom: "1px solid rgba(34,197,94,0.3)" }} className="text-[#22C55E] flex items-center justify-between px-4 py-2 text-sm">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <span className="font-semibold">Online</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#22C55E]/20 rounded-full px-2.5 py-0.5">
              <span className="text-xs">{syncState.pendingCount} to sync</span>
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
