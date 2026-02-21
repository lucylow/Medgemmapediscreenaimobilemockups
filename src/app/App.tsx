import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";
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
      <div>
        <OfflineBanner />
        <PinLock onUnlock={() => setLocked(false)} mode="verify" />
      </div>
    );
  }

  return (
    <AppProvider>
      <OfflineBanner />
      <RouterProvider router={router} />
    </AppProvider>
  );
}
