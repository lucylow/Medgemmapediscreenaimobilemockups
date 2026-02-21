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
          <div className="bg-[#FFF3E0] border-b border-[#FF9800]/30 text-[#E65100] px-4 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudOff className="w-4 h-4" />
                <span className="text-sm font-semibold">Offline Mode</span>
              </div>
              <div className="flex items-center gap-2 text-[#FF9800]">
                <Database className="w-3.5 h-3.5" />
                <span className="text-xs">{storageUsage.usageMB}MB</span>
              </div>
            </div>
            <p className="text-xs text-[#E65100]/70 mt-0.5">
              Full functionality available
              {syncState.pendingCount > 0 && ` · ${syncState.pendingCount} pending sync`}
            </p>
          </div>
        ) : syncState.status === "syncing" ? (
          <div className="bg-[#E8F0FE] border-b border-[#1A73E8]/30 text-[#1A73E8] px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm font-semibold">Syncing...</span>
              </div>
              <span className="text-xs">{syncState.progress}%</span>
            </div>
            <div className="w-full bg-[#1A73E8]/10 rounded-full h-1 mt-1.5">
              <motion.div
                className="bg-[#1A73E8] rounded-full h-1"
                initial={{ width: 0 }}
                animate={{ width: `${syncState.progress}%` }}
              />
            </div>
          </div>
        ) : syncState.pendingCount > 0 ? (
          <div className="bg-[#E8F5E9] border-b border-[#34A853]/30 text-[#34A853] flex items-center justify-between px-4 py-2 text-sm">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <span className="font-semibold">Online</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#34A853]/10 rounded-full px-2.5 py-0.5">
              <span className="text-xs">{syncState.pendingCount} to sync</span>
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
