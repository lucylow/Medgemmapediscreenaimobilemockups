import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { TabBar } from "../components/TabBar";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { Trash2, ToggleLeft, ToggleRight, Info, Server, Shield, Lock, Bell, Fingerprint, Smartphone, CloudOff, Wifi, Database, HardDrive, RefreshCw, Cpu, ChevronRight } from "lucide-react";
import { isPinEnabled, setPinEnabled, PinLock as PinLockScreen } from "./PinLock";
import { requestNotificationPermission, isNotificationSupported, getNotificationPermission } from "../platform/notifications";
import { hapticImpact, hapticNotification } from "../platform/haptics";
import { useOffline } from "../offline/OfflineContext";

export function SettingsScreen() {
  const navigate = useNavigate();
  const { clearData, children, results } = useApp();
  const { isOnline, syncState, storageUsage, swReady, cachedAssets } = useOffline();
  const [useMockApi, setUseMockApi] = useState(true);
  const [backendUrl, setBackendUrl] = useState("https://api.pediscreen.example.com");
  const [pinEnabled, setPinEnabledState] = useState(isPinEnabled());
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <h1 className="text-xl font-bold text-[#1A1A1A]">Settings</h1>
          <p className="text-sm text-[#666666]">App configuration</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">API Mode</h2>
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-[#1A73E8]" />
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">Use Mock API</p>
                    <p className="text-xs text-[#666666]">
                      {useMockApi ? "Using local screening engine" : "Using remote backend"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setUseMockApi(!useMockApi)}>
                  {useMockApi ? (
                    <ToggleRight className="w-10 h-10 text-[#34A853]" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-[#999999]" />
                  )}
                </button>
              </div>
            </div>

            {!useMockApi && (
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 space-y-2">
                <label className="text-sm font-semibold text-[#1A1A1A]">Backend URL</label>
                <input
                  type="url"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="https://api.example.com"
                  className="w-full bg-[#F8F9FA] border-2 border-gray-200 rounded-xl p-3 text-sm text-[#1A1A1A] placeholder-[#999999] focus:border-[#1A73E8] focus:outline-none"
                />
                <p className="text-xs text-[#999999]">
                  Connect to a MedGemma backend endpoint for real AI analysis
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Offline & Sync</h2>
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isOnline ? <Wifi className="w-5 h-5 text-[#34A853]" /> : <CloudOff className="w-5 h-5 text-[#FF9800]" />}
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">{isOnline ? "Online" : "Offline Mode"}</p>
                    <p className="text-xs text-[#666666]">
                      {isOnline ? "Connected · Sync active" : "Full functionality available offline"}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-[#34A853]" : "bg-[#FF9800]"} animate-pulse`} />
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[#666666]">
                    <HardDrive className="w-4 h-4" />
                    <span>Storage Used</span>
                  </div>
                  <span className="font-semibold text-[#1A1A1A]">{storageUsage.usageMB} MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#1A73E8] to-[#34A853] rounded-full h-2 transition-all" style={{ width: `${Math.min(storageUsage.percent, 100)}%` }} />
                </div>
                <p className="text-xs text-[#999999]">{storageUsage.percent}% of {storageUsage.quotaMB} MB quota</p>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#666666]">Service Worker</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${swReady ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFF3E0] text-[#E65100]"}`}>
                    {swReady ? "Active" : "Loading"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#666666]">Cached Assets</span>
                  <span className="font-semibold text-[#1A1A1A]">{cachedAssets} files</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#666666]">Pending Sync</span>
                  <span className="font-semibold text-[#1A1A1A]">{syncState.pendingCount} items</span>
                </div>
                {syncState.failedCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#EA4335]">Failed Sync</span>
                    <span className="font-semibold text-[#EA4335]">{syncState.failedCount} items</span>
                  </div>
                )}
              </div>

              <div className="bg-[#F0F7FF] rounded-xl p-3 flex items-start gap-2">
                <Database className="w-4 h-4 text-[#1A73E8] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#1A73E8]">
                  All screenings work offline. Data syncs automatically when connected. 72hr+ offline capacity.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Security</h2>
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[#9C27B0]" />
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">PIN Lock</p>
                    <p className="text-xs text-[#666666]">
                      {pinEnabled ? "App locked with 4-digit PIN" : "Protect health data with a PIN"}
                    </p>
                  </div>
                </div>
                <button onClick={() => {
                  hapticImpact("medium");
                  if (pinEnabled) {
                    setPinEnabled(false);
                    setPinEnabledState(false);
                  } else {
                    setShowPinSetup(true);
                  }
                }}>
                  {pinEnabled ? (
                    <ToggleRight className="w-10 h-10 text-[#9C27B0]" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-[#999999]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {isNotificationSupported() && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Notifications</h2>
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#FF9800]" />
                    <div>
                      <p className="font-semibold text-[#1A1A1A]">Screening Alerts</p>
                      <p className="text-xs text-[#666666]">
                        {notifPermission === "granted" ? "Enabled" : notifPermission === "denied" ? "Blocked in browser" : "Get alerts for results"}
                      </p>
                    </div>
                  </div>
                  <button onClick={async () => {
                    hapticImpact("light");
                    const granted = await requestNotificationPermission();
                    setNotifPermission(granted ? "granted" : "denied");
                    if (granted) hapticNotification("success");
                  }} disabled={notifPermission === "denied"}>
                    {notifPermission === "granted" ? (
                      <ToggleRight className="w-10 h-10 text-[#FF9800]" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-[#999999]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Edge AI</h2>
            <button
              onClick={() => navigate("/edge-diagnostics")}
              className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-[#1A73E8]" />
                <div className="text-left">
                  <p className="font-semibold text-[#1A1A1A]">Edge AI Diagnostics</p>
                  <p className="text-xs text-[#666666]">View on-device model status & benchmarks</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#999999]" />
            </button>
            <button
              onClick={() => navigate("/medgemma-models")}
              className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-[#9C27B0]" />
                <div className="text-left">
                  <p className="font-semibold text-[#1A1A1A]">MedGemma Models</p>
                  <p className="text-xs text-[#666666]">View model registry, benchmarks & deployment</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#999999]" />
            </button>
            <button
              onClick={() => navigate("/xray-analysis")}
              className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-[#E91E63]" />
                <div className="text-left">
                  <p className="font-semibold text-[#1A1A1A]">Bone Age X-ray</p>
                  <p className="text-xs text-[#666666]">Greulich-Pyle bone age assessment</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#999999]" />
            </button>
            <button
              onClick={() => navigate("/ct-scan")}
              className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-[#00838F]" />
                <div className="text-left">
                  <p className="font-semibold text-[#1A1A1A]">CT Scan Analysis</p>
                  <p className="text-xs text-[#666666]">3D CT volume inference for pediatric emergencies</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#999999]" />
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Data</h2>
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#1A1A1A]">Stored Data</p>
                  <p className="text-xs text-[#666666]">
                    {children.length} child{children.length !== 1 ? "ren" : ""}, {results.length} screening{results.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete ALL stored data? This cannot be undone.")) {
                    clearData();
                    navigate("/");
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#EA4335] text-[#EA4335] font-semibold text-sm active:scale-[0.98] transition-transform"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Privacy & Safety</h2>
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#34A853] flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-[#1A1A1A]">
                    All data is stored locally on this device only. No information is sent to external servers.
                  </p>
                  <p className="text-sm text-[#1A1A1A]">
                    No full names, addresses, or other identifying information is collected.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">About</h2>
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#1A1A1A]">PediScreen AI</p>
                  <p className="text-xs text-[#666666]">MedGemma Impact Challenge</p>
                  <p className="text-xs text-[#666666]">Version 1.2.0 — Offline-First</p>
                  <p className="text-xs text-[#666666]">Model: medgemma-pediscreen v1.0.0-demo</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {[
                      { label: "Haptics", icon: "🎚️" },
                      { label: "Camera", icon: "📷" },
                      { label: "PIN Lock", icon: "🔒" },
                      { label: "Offline-First", icon: "📴" },
                      { label: "Sync Queue", icon: "🔄" },
                      { label: "IndexedDB", icon: "💾" },
                      { label: "PWA", icon: "📱" },
                      { label: "Swipe", icon: "👆" },
                      { label: "Alerts", icon: "🔔" },
                    ].map((feat) => (
                      <span key={feat.label} className="inline-flex items-center gap-0.5 bg-[#F8F9FA] border border-gray-200 rounded-full px-2 py-0.5 text-[10px] text-[#666666]">
                        {feat.icon} {feat.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#999999] mt-2">
                    Pediatric developmental screening tool. This application supports screening only and does not make diagnoses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DisclaimerFooter />
        <TabBar />
      </div>

      {showPinSetup && (
        <div className="fixed inset-0 z-50">
          <PinLockScreen
            onUnlock={() => {}}
            mode="setup"
            onSetupComplete={() => {
              setPinEnabledState(true);
              setShowPinSetup(false);
              hapticNotification("success");
            }}
          />
        </div>
      )}
    </MobileContainer>
  );
}
