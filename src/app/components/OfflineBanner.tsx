import { useOffline } from "../offline/OfflineContext";
import { WifiOff, Wifi, CloudOff, RefreshCw, Database, CheckCircle } from "lucide-react";
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
          <div className="bg-gradient-to-r from-[#FF9800] to-[#F57C00] text-white px-4 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudOff className="w-4 h-4" />
                <span className="text-sm font-semibold">Offline Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                <span className="text-xs">{storageUsage.usageMB}MB stored</span>
              </div>
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              Full functionality available · Data saved locally
              {syncState.pendingCount > 0 && ` · ${syncState.pendingCount} pending sync`}
            </p>
          </div>
        ) : syncState.status === "syncing" ? (
          <div className="bg-gradient-to-r from-[#1A73E8] to-[#4285F4] text-white px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm font-semibold">Syncing...</span>
              </div>
              <span className="text-xs">{syncState.progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1 mt-1.5">
              <motion.div
                className="bg-white rounded-full h-1"
                initial={{ width: 0 }}
                animate={{ width: `${syncState.progress}%` }}
              />
            </div>
          </div>
        ) : syncState.pendingCount > 0 ? (
          <div className="bg-[#34A853] text-white flex items-center justify-between px-4 py-2 text-sm">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <span className="font-semibold">Online</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-0.5">
              <span className="text-xs">{syncState.pendingCount} to sync</span>
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
