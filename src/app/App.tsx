import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";
import { OfflineProvider } from "./offline/OfflineContext";
import { EdgeStatusProvider } from "./edge/EdgeStatusContext";
import { OfflineBanner } from "./components/OfflineBanner";
import { PinLock, isPinEnabled, getSavedPin } from "./screens/PinLock";

export default function App() {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (isPinEnabled() && getSavedPin()) {
      setLocked(true);
    }
  }, []);

  if (locked) {
    return (
      <OfflineProvider>
        <OfflineBanner />
        <PinLock onUnlock={() => setLocked(false)} mode="verify" />
      </OfflineProvider>
    );
  }

  return (
    <EdgeStatusProvider>
      <AppProvider>
        <OfflineProvider>
          <OfflineBanner />
          <RouterProvider router={router} />
        </OfflineProvider>
      </AppProvider>
    </EdgeStatusProvider>
  );
}
