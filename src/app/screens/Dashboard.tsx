import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { Plus, TrendingUp, Users, Activity, BarChart3, ArrowLeft, Stethoscope, Camera, Ruler, QrCode, CloudOff, Wifi, Database, Shield } from "lucide-react";
import { TabBar } from "../components/TabBar";
import { motion } from "motion/react";
import {
  RISK_LABELS,
  RISK_COLORS,
  RiskLevel,
  DOMAIN_LABELS,
  DOMAIN_ICONS,
} from "../data/types";
import { useOffline } from "../offline/OfflineContext";

export function Dashboard() {
  const navigate = useNavigate();
  const { children, results, sessions, role } = useApp();

  const { isOnline, syncState, storageUsage, swReady, cachedAssets, totalScreened, totalIdentified, totalSavings } = useOffline();

  const riskCounts: Record<RiskLevel, number> = { on_track: 0, monitor: 0, discuss: 0, refer: 0 };
  results.forEach((r) => { riskCounts[r.overallRisk]++; });

  const recentResults = [...results]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">
                {role === "chw" ? "CHW Dashboard" : "My Dashboard"}
              </h1>
              <p className="text-sm text-[#666666]">
                {children.length} child{children.length !== 1 ? "ren" : ""} · {results.length} screening{results.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-[#1A73E8] font-semibold"
            >
              Home
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {results.length > 0 ? (
            <>
              <div className="grid grid-cols-4 gap-2">
                {(["on_track", "monitor", "discuss", "refer"] as RiskLevel[]).map((risk) => (
                  <motion.div
                    key={risk}
                    className="rounded-2xl p-3 text-center text-white"
                    style={{ backgroundColor: RISK_COLORS[risk] }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <div className="text-2xl font-bold">{riskCounts[risk]}</div>
                    <div className="text-[10px] mt-1 leading-tight">{RISK_LABELS[risk]}</div>
                  </motion.div>
                ))}
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">Recent Screenings</h2>
                <div className="space-y-3">
                  {recentResults.map((result) => {
                    const child = children.find((c) => c.id === result.childId);
                    return (
                      <div
                        key={result.sessionId}
                        className="bg-white border-l-4 rounded-2xl p-4 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                        style={{ borderColor: RISK_COLORS[result.overallRisk] }}
                        onClick={() => navigate(`/screening-results/${result.sessionId}`)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#1A1A1A]">
                            {child?.displayName || "Unknown"} · {result.ageMonths}mo
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-1 rounded-full text-white"
                            style={{ backgroundColor: RISK_COLORS[result.overallRisk] }}
                          >
                            {RISK_LABELS[result.overallRisk]}
                          </span>
                        </div>
                        <p className="text-sm text-[#666666]">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.domainRisks
                            .filter((d) => d.risk !== "on_track")
                            .map((dr) => (
                              <span
                                key={dr.domain}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ backgroundColor: RISK_COLORS[dr.risk] + "20", color: RISK_COLORS[dr.risk] }}
                              >
                                {DOMAIN_ICONS[dr.domain]} {DOMAIN_LABELS[dr.domain]}
                              </span>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Activity className="w-16 h-16 text-[#E0E0E0]" />
              <h2 className="text-lg font-bold text-[#1A1A1A]">No screenings yet</h2>
              <p className="text-[#666666] max-w-[280px]">
                Add a child and complete a screening to see results on your dashboard
              </p>
            </div>
          )}

          <div className="rounded-2xl border-2 border-gray-100 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Offline Status</h2>
              <div className="flex items-center gap-1.5">
                {isOnline ? (
                  <><Wifi className="w-3.5 h-3.5 text-[#34A853]" /><span className="text-xs text-[#34A853] font-semibold">Online</span></>
                ) : (
                  <><CloudOff className="w-3.5 h-3.5 text-[#FF9800]" /><span className="text-xs text-[#FF9800] font-semibold">Offline</span></>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#F0F7FF] rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-[#1A73E8]">{children.length + results.length}</div>
                <div className="text-[10px] text-[#666666]">Local Records</div>
              </div>
              <div className="bg-[#F0FFF4] rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-[#34A853]">{storageUsage.usageMB}</div>
                <div className="text-[10px] text-[#666666]">MB Stored</div>
              </div>
              <div className="bg-[#FFF8E1] rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-[#FF9800]">{syncState.pendingCount}</div>
                <div className="text-[10px] text-[#666666]">Pending Sync</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#666666]">
              <Shield className="w-3.5 h-3.5 text-[#34A853]" />
              <span>{swReady ? "Service Worker active · Full offline ready" : "Preparing offline cache..."}</span>
            </div>
            {totalScreened > 0 && (
              <div className="bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#2E7D32]">Local Impact</p>
                    <p className="text-lg font-bold text-[#1B5E20]">${totalSavings.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#666666]">{totalScreened} screened</p>
                    <p className="text-xs text-[#666666]">{totalIdentified} identified</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">Children</h2>
            <div className="space-y-2">
              {children.map((child) => {
                const childResults = results.filter((r) => r.childId === child.id);
                const lastResult = childResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                return (
                  <div
                    key={child.id}
                    className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => navigate(`/timeline/${child.id}`)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">
                        {child.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A1A1A]">{child.displayName}</p>
                      <p className="text-xs text-[#666666]">
                        {childResults.length} screening{childResults.length !== 1 ? "s" : ""}
                        {lastResult && ` · Last: ${RISK_LABELS[lastResult.overallRisk]}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-2">
          <button
            onClick={() => navigate("/symptom-checker")}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#1A73E8] to-[#4285F4] text-white active:scale-[0.98] transition-transform shadow-md"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Quick Symptom Checker</p>
              <p className="text-xs text-white/70">Rapid milestone assessment</p>
            </div>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate("/rash-analysis")}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] text-white active:scale-[0.98] transition-transform shadow-md"
            >
              <Camera className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-bold text-xs">Rash Analysis</p>
                <p className="text-[10px] text-white/70">Skin screening</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/growth-tracker")}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-[#34A853] to-[#2E7D32] text-white active:scale-[0.98] transition-transform shadow-md"
            >
              <Ruler className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-bold text-xs">Growth Tracker</p>
                <p className="text-[10px] text-white/70">WHO percentiles</p>
              </div>
            </button>
          </div>
          <button
            onClick={() => navigate("/qr-scanner")}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#9C27B0] to-[#7B1FA2] text-white active:scale-[0.98] transition-transform shadow-md"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">QR Patient Scanner</p>
              <p className="text-xs text-white/70">Instant record lookup · 0.8s scan</p>
            </div>
          </button>
          <div className="grid grid-cols-2 gap-3">
            <PrimaryButton onClick={() => navigate("/children")}>
              <Users className="w-5 h-5 mr-1 inline" />
              Children
            </PrimaryButton>
            <PrimaryButton variant="success" onClick={() => navigate("/add-child")}>
              <Plus className="w-5 h-5 mr-1 inline" />
              New Child
            </PrimaryButton>
          </div>
        </div>
        <DisclaimerFooter />
        <TabBar />
      </div>
    </MobileContainer>
  );
}
