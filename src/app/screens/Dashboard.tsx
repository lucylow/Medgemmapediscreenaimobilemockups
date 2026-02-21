import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { Plus, TrendingUp, Users, Activity, BarChart3, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import {
  RISK_LABELS,
  RISK_COLORS,
  RiskLevel,
  DOMAIN_LABELS,
  DOMAIN_ICONS,
} from "../data/types";

export function Dashboard() {
  const navigate = useNavigate();
  const { children, results, sessions, role } = useApp();

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

        <div className="px-6 py-4 grid grid-cols-2 gap-3">
          <PrimaryButton onClick={() => navigate("/children")}>
            <Users className="w-5 h-5 mr-1 inline" />
            Children
          </PrimaryButton>
          <PrimaryButton variant="success" onClick={() => navigate("/add-child")}>
            <Plus className="w-5 h-5 mr-1 inline" />
            New Child
          </PrimaryButton>
        </div>
        <DisclaimerFooter />
      </div>
    </MobileContainer>
  );
}
