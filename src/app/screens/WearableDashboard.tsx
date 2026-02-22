import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { TabBar } from "../components/TabBar";
import { useWearable } from "../wearable/WearableContext";
import {
  ArrowLeft, Watch, Activity, Heart, Moon, Wind, AlertTriangle,
  Bluetooth, BluetoothOff, RefreshCw, ChevronRight, Zap, Shield,
  TrendingUp, TrendingDown, Minus, Battery, Clock, Baby,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

function getRiskColor(risk: string) {
  switch (risk) {
    case "high": return "#EA4335";
    case "medium": return "#F9AB00";
    default: return "#34A853";
  }
}

function getRiskBg(risk: string) {
  switch (risk) {
    case "high": return "bg-red-50 border-red-200";
    case "medium": return "bg-amber-50 border-amber-200";
    default: return "bg-green-50 border-green-200";
  }
}

function MetricCard({
  icon: Icon, label, value, unit, status, statusColor, trend,
}: {
  icon: any; label: string; value: string; unit: string;
  status: string; statusColor: string; trend?: "up" | "down" | "stable";
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#1A73E8]" />
          </div>
          <span className="text-sm font-semibold text-[#666666]">{label}</span>
        </div>
        {trend && (
          <TrendIcon className={`w-4 h-4 ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-400"}`} />
        )}
      </div>
      <div>
        <span className="text-2xl font-bold text-[#1A1A1A]">{value}</span>
        <span className="text-sm text-[#999999] ml-1">{unit}</span>
      </div>
      <span className="text-xs font-semibold" style={{ color: statusColor }}>{status}</span>
    </div>
  );
}

export function WearableDashboard() {
  const navigate = useNavigate();
  const { status, metrics, trend, summary, devices, ageMonths, connect, disconnect, refresh, setAge } = useWearable();
  const [activeChart, setActiveChart] = useState<"steps" | "hrv" | "sleep" | "spo2">("steps");

  const chartDataKey: Record<string, { key: string; color: string; label: string }> = {
    steps: { key: "stepsPerDay", color: "#1A73E8", label: "Steps/Day" },
    hrv: { key: "hrvRmssd", color: "#F9AB00", label: "HRV RMSSD (ms)" },
    sleep: { key: "sleepHours", color: "#8B5CF6", label: "Sleep (hours)" },
    spo2: { key: "spo2Average", color: "#34A853", label: "SpO2 (%)" },
  };

  const chart = chartDataKey[activeChart];

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1A1A1A]">Wearable Monitor</h1>
            <p className="text-sm text-[#666666]">IoT Health Screening</p>
          </div>
          {status === "connected" && (
            <button onClick={refresh} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100">
              <RefreshCw className="w-5 h-5 text-[#1A73E8]" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {status !== "connected" ? (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-[#E8F0FE] to-[#D2E3FC] rounded-2xl p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-white/80 rounded-2xl flex items-center justify-center">
                  <Watch className="w-8 h-8 text-[#1A73E8]" />
                </div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">Connect Wearables</h2>
                <p className="text-sm text-[#666666] max-w-xs mx-auto">
                  Link Apple Watch, Fitbit, Owlet, or any Bluetooth health device for continuous developmental monitoring.
                </p>
                <button
                  onClick={connect}
                  disabled={status === "connecting"}
                  className="w-full py-4 bg-[#1A73E8] text-white font-bold rounded-xl text-lg disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {status === "connecting" ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Bluetooth className="w-5 h-5" />
                      Connect via Bluetooth
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Supported Devices</h3>
                {[
                  { name: "Owlet Dream Sock", desc: "SpO2, Heart Rate, Sleep", icon: Baby },
                  { name: "Apple Watch", desc: "HRV, Steps, Falls, Sleep", icon: Watch },
                  { name: "Fitbit Ace", desc: "Steps, Sleep, Activity", icon: Activity },
                ].map((d) => (
                  <div key={d.name} className="bg-white rounded-xl border-2 border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E8F0FE] rounded-xl flex items-center justify-center">
                      <d.icon className="w-5 h-5 text-[#1A73E8]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A1A1A]">{d.name}</p>
                      <p className="text-xs text-[#999999]">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#999999] uppercase tracking-wider">Child Age</label>
                <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
                  <input
                    type="range" min={1} max={60} value={ageMonths}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full accent-[#1A73E8]"
                  />
                  <div className="flex justify-between text-xs text-[#999999] mt-1">
                    <span>1 month</span>
                    <span className="font-bold text-[#1A73E8]">{ageMonths} months</span>
                    <span>60 months</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {summary && (
                <div className={`rounded-2xl border-2 p-4 ${getRiskBg(summary.overallRisk)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: getRiskColor(summary.overallRisk) }}>
                        {summary.overallRisk} RISK
                      </p>
                      <p className="text-2xl font-bold mt-1" style={{ color: getRiskColor(summary.overallRisk) }}>
                        {summary.wearableScore}/100
                      </p>
                      <p className="text-xs text-[#666666] mt-1">Wearable Composite Score</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center" style={{ borderColor: getRiskColor(summary.overallRisk) }}>
                      <Shield className="w-7 h-7" style={{ color: getRiskColor(summary.overallRisk) }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-[#1A73E8]" />
                  <span className="text-sm font-semibold text-[#666666]">Age: {ageMonths}mo</span>
                </div>
                <input
                  type="range" min={1} max={60} value={ageMonths}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-32 accent-[#1A73E8]"
                />
              </div>

              {devices.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Connected Devices</h3>
                  {devices.map((d) => (
                    <div key={d.id} className="bg-white rounded-xl border-2 border-gray-100 p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <Bluetooth className="w-4 h-4 text-[#34A853]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">{d.name}</p>
                        <p className="text-xs text-[#999999]">{d.type.replace("_", " ")}</p>
                      </div>
                      {d.battery && (
                        <div className="flex items-center gap-1">
                          <Battery className="w-4 h-4 text-[#34A853]" />
                          <span className="text-xs font-semibold text-[#34A853]">{d.battery}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {metrics && (
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    icon={Activity} label="Activity" value={metrics.stepsPerDay.toFixed(0)} unit="steps/day"
                    status={metrics.stepsPerDay < 800 ? "Motor concern" : "On track"}
                    statusColor={metrics.stepsPerDay < 800 ? "#EA4335" : "#34A853"}
                    trend={metrics.stepsPerDay > 2000 ? "up" : metrics.stepsPerDay < 800 ? "down" : "stable"}
                  />
                  <MetricCard
                    icon={Heart} label="HRV" value={metrics.hrvRmssd.toFixed(0)} unit="ms RMSSD"
                    status={metrics.hrvRmssd < 15 ? "High stress" : metrics.hrvRmssd < 25 ? "Borderline" : "Normal"}
                    statusColor={metrics.hrvRmssd < 15 ? "#EA4335" : metrics.hrvRmssd < 25 ? "#F9AB00" : "#34A853"}
                    trend={metrics.hrvRmssd > 25 ? "up" : metrics.hrvRmssd < 15 ? "down" : "stable"}
                  />
                  <MetricCard
                    icon={Moon} label="Sleep" value={metrics.sleepHours.toFixed(1)} unit="h/night"
                    status={metrics.sleepHours < 10 ? "Suboptimal" : "Adequate"}
                    statusColor={metrics.sleepHours < 10 ? "#F9AB00" : "#34A853"}
                    trend={metrics.sleepHours >= 10 ? "up" : "down"}
                  />
                  <MetricCard
                    icon={Wind} label="SpO2" value={metrics.spo2Average.toFixed(1)} unit="%"
                    status={metrics.spo2Average < 92 ? "Hypoxemia" : metrics.spo2Average < 95 ? "Borderline" : "Normal"}
                    statusColor={metrics.spo2Average < 92 ? "#EA4335" : metrics.spo2Average < 95 ? "#F9AB00" : "#34A853"}
                    trend={metrics.spo2Average >= 95 ? "up" : "down"}
                  />
                  <div className="col-span-2">
                    <MetricCard
                      icon={AlertTriangle} label="Fall Events" value={metrics.fallEventsPerHour.toFixed(1)} unit="/hour"
                      status={metrics.fallEventsPerHour > 3 ? "PT referral" : metrics.fallEventsPerHour > 2 ? "Above avg" : "Normal"}
                      statusColor={metrics.fallEventsPerHour > 3 ? "#EA4335" : metrics.fallEventsPerHour > 2 ? "#F9AB00" : "#34A853"}
                      trend={metrics.fallEventsPerHour <= 2 ? "up" : "down"}
                    />
                  </div>
                </div>
              )}

              {trend.length > 0 && (
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#1A1A1A]">7-Day Trends</h3>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {(["steps", "hrv", "sleep", "spo2"] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setActiveChart(k)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          activeChart === k ? "bg-[#1A73E8] text-white" : "bg-gray-100 text-[#666666]"
                        }`}
                      >
                        {chartDataKey[k].label}
                      </button>
                    ))}
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend}>
                        <defs>
                          <linearGradient id={`color-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chart.color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#999" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#999" width={40} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                        />
                        <Area
                          type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2}
                          fill={`url(#color-${activeChart})`} dot={{ r: 3, fill: chart.color }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {summary && summary.risks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Clinical Findings</h3>
                  {summary.risks.map((risk, i) => (
                    <div key={i} className={`rounded-xl border-2 p-4 space-y-2 ${getRiskBg(risk.riskLevel)}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase" style={{ color: getRiskColor(risk.riskLevel) }}>
                          {risk.domain} — {risk.riskLevel}
                        </span>
                        <span className="text-xs text-[#999999]">P{risk.percentile} · {(risk.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-sm text-[#1A1A1A]">{risk.finding}</p>
                      <p className="text-xs text-[#666666]">{risk.recommendation}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {risk.icd10Codes.map((c) => (
                          <span key={c} className="text-[10px] bg-white/60 rounded px-1.5 py-0.5 font-mono text-[#666666]">{c}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {summary && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Recommendations</h3>
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-3">
                    {summary.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#E8F0FE] flex items-center justify-center text-xs font-bold text-[#1A73E8] flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-sm text-[#1A1A1A]">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate("/wearable-hrv")}
                className="w-full py-4 bg-gradient-to-r from-[#F9AB00] to-[#E37400] text-white font-bold rounded-xl text-base flex items-center justify-center gap-3"
              >
                <Heart className="w-5 h-5" />
                HRV Deep Analysis
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={disconnect}
                className="w-full py-3 border-2 border-gray-200 text-[#999999] font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <BluetoothOff className="w-4 h-4" />
                Disconnect Devices
              </button>

              <div className="bg-[#FFF3E0] rounded-2xl p-4">
                <p className="text-sm text-[#E65100] font-semibold mb-1">Clinical Disclaimer</p>
                <p className="text-xs text-[#E65100]">
                  Wearable data provides supplementary screening information only. Not a diagnostic tool.
                  All risk assessments require clinical validation. Thresholds are based on pediatric reference ranges and
                  may not apply to all populations. Consult a healthcare provider for medical decisions.
                </p>
              </div>
            </>
          )}
        </div>

        <TabBar />
      </div>
    </MobileContainer>
  );
}
