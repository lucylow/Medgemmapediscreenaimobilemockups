import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { useWearable } from "../wearable/WearableContext";
import {
  ArrowLeft, Heart, Activity, Brain, AlertTriangle, CheckCircle, Clock, TrendingUp, Zap,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea,
} from "recharts";

function getHRVZone(hrv: number): { label: string; color: string; bg: string; desc: string } {
  if (hrv < 15) return { label: "High Stress", color: "#EA4335", bg: "bg-red-50", desc: "Autonomic nervous system under stress. May indicate dysregulation, pain, or illness." };
  if (hrv < 25) return { label: "Moderate", color: "#F9AB00", bg: "bg-amber-50", desc: "Borderline autonomic regulation. Monitor for trends over 7-14 days." };
  if (hrv < 40) return { label: "Normal", color: "#34A853", bg: "bg-green-50", desc: "Healthy autonomic maturity for age. Good vagal tone." };
  return { label: "Excellent", color: "#1A73E8", bg: "bg-blue-50", desc: "Strong parasympathetic activity. Indicates good stress resilience." };
}

export function WearableHRVScreen() {
  const navigate = useNavigate();
  const { metrics, trend, ageMonths } = useWearable();

  if (!metrics) {
    return (
      <MobileContainer>
        <div className="h-full flex flex-col items-center justify-center p-6">
          <Heart className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-[#666666] text-center">Connect a wearable device first to view HRV analysis.</p>
          <button onClick={() => navigate("/wearable")} className="mt-4 text-[#1A73E8] font-semibold">
            Go to Wearable Monitor
          </button>
        </div>
      </MobileContainer>
    );
  }

  const zone = getHRVZone(metrics.hrvRmssd);

  const maturityData = [
    { age: "0-3mo", low: 8, median: 18, high: 35, current: ageMonths <= 3 ? metrics.hrvRmssd : null },
    { age: "3-6mo", low: 10, median: 22, high: 40, current: ageMonths > 3 && ageMonths <= 6 ? metrics.hrvRmssd : null },
    { age: "6-12mo", low: 12, median: 25, high: 45, current: ageMonths > 6 && ageMonths <= 12 ? metrics.hrvRmssd : null },
    { age: "12-24mo", low: 15, median: 30, high: 50, current: ageMonths > 12 && ageMonths <= 24 ? metrics.hrvRmssd : null },
    { age: "24-36mo", low: 18, median: 35, high: 55, current: ageMonths > 24 && ageMonths <= 36 ? metrics.hrvRmssd : null },
    { age: "36-60mo", low: 20, median: 38, high: 60, current: ageMonths > 36 ? metrics.hrvRmssd : null },
  ];

  const hrvPercentile = metrics.hrvRmssd < 15 ? 5 : metrics.hrvRmssd < 25 ? 20 : metrics.hrvRmssd < 40 ? 55 : 85;

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">HRV Analysis</h1>
            <p className="text-sm text-[#666666]">Autonomic Maturity Screening</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className={`rounded-2xl border-2 p-6 text-center space-y-3 ${zone.bg}`} style={{ borderColor: zone.color + "40" }}>
            <div className="w-20 h-20 mx-auto rounded-full border-4 flex items-center justify-center" style={{ borderColor: zone.color }}>
              <Heart className="w-10 h-10" style={{ color: zone.color }} />
            </div>
            <p className="text-4xl font-bold" style={{ color: zone.color }}>
              {metrics.hrvRmssd.toFixed(0)} <span className="text-lg">ms</span>
            </p>
            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: zone.color }}>
              {zone.label}
            </p>
            <p className="text-xs text-[#666666] max-w-sm mx-auto">{zone.desc}</p>
            <p className="text-xs text-[#999999]">Percentile: P{hrvPercentile} for {ageMonths}mo</p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-3">
            <h3 className="font-bold text-[#1A1A1A]">7-Day HRV Trend</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#999" width={35} domain={[0, "auto"]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }} />
                  <ReferenceArea y1={0} y2={15} fill="#EA4335" fillOpacity={0.08} />
                  <ReferenceArea y1={15} y2={25} fill="#F9AB00" fillOpacity={0.06} />
                  <ReferenceLine y={15} stroke="#EA4335" strokeDasharray="5 5" label={{ value: "15ms", fontSize: 10, fill: "#EA4335" }} />
                  <Line type="monotone" dataKey="hrvRmssd" stroke="#F9AB00" strokeWidth={2.5} dot={{ r: 4, fill: "#F9AB00" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-200" /> High Stress (&lt;15ms)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-200" /> Moderate (15-25ms)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-200" /> Normal (&gt;25ms)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-3">
            <h3 className="font-bold text-[#1A1A1A]">Autonomic Maturity Curve</h3>
            <p className="text-xs text-[#999999]">Pediatric HRV reference ranges by age</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={maturityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="age" tick={{ fontSize: 10 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#999" width={35} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }} />
                  <Line type="monotone" dataKey="high" stroke="#34A853" strokeDasharray="4 4" strokeWidth={1} dot={false} name="P95" />
                  <Line type="monotone" dataKey="median" stroke="#1A73E8" strokeWidth={2} dot={false} name="P50" />
                  <Line type="monotone" dataKey="low" stroke="#EA4335" strokeDasharray="4 4" strokeWidth={1} dot={false} name="P5" />
                  <Line type="monotone" dataKey="current" stroke="#F9AB00" strokeWidth={0} dot={{ r: 6, fill: "#F9AB00", stroke: "#E37400", strokeWidth: 2 }} name="Current" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Clinical Indicators</h3>
            <div className="bg-white rounded-2xl border-2 border-gray-100 divide-y divide-gray-100">
              <IndicatorRow
                icon={<Brain className="w-4 h-4 text-[#8B5CF6]" />}
                label="Vagal Tone"
                value={metrics.hrvRmssd > 25 ? "Adequate" : "Reduced"}
                color={metrics.hrvRmssd > 25 ? "#34A853" : "#EA4335"}
              />
              <IndicatorRow
                icon={<Activity className="w-4 h-4 text-[#1A73E8]" />}
                label="Sympathovagal Balance"
                value={metrics.hrvRmssd > 20 ? "Balanced" : "Sympathetic Dominant"}
                color={metrics.hrvRmssd > 20 ? "#34A853" : "#F9AB00"}
              />
              <IndicatorRow
                icon={<Zap className="w-4 h-4 text-[#F9AB00]" />}
                label="Stress Response"
                value={metrics.hrvRmssd < 15 ? "Elevated" : "Normal"}
                color={metrics.hrvRmssd < 15 ? "#EA4335" : "#34A853"}
              />
              <IndicatorRow
                icon={<TrendingUp className="w-4 h-4 text-[#34A853]" />}
                label="Maturity Index"
                value={`P${hrvPercentile} for age`}
                color={hrvPercentile > 20 ? "#34A853" : "#EA4335"}
              />
              <IndicatorRow
                icon={<Clock className="w-4 h-4 text-[#999999]" />}
                label="Recovery Capacity"
                value={metrics.hrvRmssd > 30 ? "Good" : metrics.hrvRmssd > 20 ? "Fair" : "Poor"}
                color={metrics.hrvRmssd > 30 ? "#34A853" : metrics.hrvRmssd > 20 ? "#F9AB00" : "#EA4335"}
              />
            </div>
          </div>

          {metrics.hrvRmssd < 25 && (
            <div className="bg-[#FFF3E0] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#E65100]" />
                <p className="text-sm font-bold text-[#E65100]">Action Required</p>
              </div>
              <ul className="text-xs text-[#E65100] space-y-1.5 ml-7">
                <li>Consider developmental pediatrician referral for autonomic assessment</li>
                <li>Evaluate for environmental stressors and sensory processing</li>
                <li>Request cortisol panel if HRV consistently below 15ms</li>
                <li>Implement calming routines: skin-to-skin, reduced stimulation</li>
              </ul>
            </div>
          )}

          {metrics.hrvRmssd >= 25 && (
            <div className="bg-[#E6F4EA] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#34A853]" />
                <p className="text-sm font-bold text-[#34A853]">Autonomic Health: Normal</p>
              </div>
              <p className="text-xs text-[#137333] ml-7">
                HRV indicates healthy autonomic maturation. Continue routine monitoring.
                Next screening recommended in 3 months.
              </p>
            </div>
          )}

          <div className="bg-[#F3E8FD] rounded-2xl p-4">
            <p className="text-sm text-[#7C3AED] font-semibold mb-1">About HRV Screening</p>
            <p className="text-xs text-[#7C3AED]">
              Heart Rate Variability (RMSSD) reflects parasympathetic nervous system activity.
              In pediatric populations, low HRV correlates with autonomic immaturity, stress dysregulation,
              and potential developmental concerns. Reference ranges derived from pediatric normative data.
              Target sensitivity: 92% for autonomic domain screening.
            </p>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

function IndicatorRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {icon}
      <span className="text-sm text-[#666666] flex-1">{label}</span>
      <span className="text-sm font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}
