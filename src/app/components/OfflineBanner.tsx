import { useOnlineStatus } from "../platform/useOnlineStatus";
import { WifiOff, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-[#FF9800] text-white flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold overflow-hidden"
        >
          <WifiOff className="w-4 h-4" />
          Offline — Your data is saved locally
        </motion.div>
      )}
    </AnimatePresence>
  );
}
