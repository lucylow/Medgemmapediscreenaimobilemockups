import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Ruler, Weight, Activity, TrendingUp, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { TabBar } from "../components/TabBar";
import { useApp } from "../context/AppContext";
import {
  calculateZScore,
  getPercentileCurve,
  getGrowthMeasurements,
  saveGrowthMeasurement,
  deleteGrowthMeasurement,
  CLASSIFICATION_COLORS,
  CLASSIFICATION_LABELS,
  type GrowthMeasurement,
  type ZScoreResult,
} from "../data/growthStandards";
import { hapticSelection, hapticImpact, hapticNotification } from "../platform/haptics";
import { motion, AnimatePresence } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from "recharts";

type MeasureTab = "weight" | "height" | "headCircumference";

const TAB_CONFIG: Record<MeasureTab, { label: string; unit: string; icon: typeof Weight; color: string }> = {
  weight: { label: "Weight", unit: "kg", icon: Weight, color: "#1A73E8" },
  height: { label: "Height", unit: "cm", icon: Ruler, color: "#34A853" },
  headCircumference: { label: "Head Circ.", unit: "cm", icon: Activity, color: "#FF9800" },
};

function getAgeMonthsAtDate(birthDate: string, atDate?: string): number {
  const birth = new Date(birthDate);
  const target = atDate ? new Date(atDate) : new Date();
  return Math.max(0, Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
}

export function GrowthTracker() {
  const navigate = useNavigate();
  const { children } = useApp();

  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || "");
  const [activeTab, setActiveTab] = useState<MeasureTab>("weight");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formWeight, setFormWeight] = useState("");
  const [formHeight, setFormHeight] = useState("");
  const [formHC, setFormHC] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const sex = selectedChild?.sex === "female" ? "female" : "male" as const;
  const measurements = useMemo(() => {
    return getGrowthMeasurements(selectedChildId).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [selectedChildId, showAddForm, refreshKey]);

  const currentAge = selectedChild ? getAgeMonthsAtDate(selectedChild.birthDate) : 12;

  const latestMeasurement = measurements[measurements.length - 1];
  const latestZScores = useMemo(() => {
    if (!latestMeasurement) return null;
    const results: Partial<Record<MeasureTab, ZScoreResult>> = {};
    if (latestMeasurement.weight) results.weight = calculateZScore(latestMeasurement.weight, latestMeasurement.ageMonths, sex, "weight");
    if (latestMeasurement.height) results.height = calculateZScore(latestMeasurement.height, latestMeasurement.ageMonths, sex, "height");
    if (latestMeasurement.headCircumference) results.headCircumference = calculateZScore(latestMeasurement.headCircumference, latestMeasurement.ageMonths, sex, "headCircumference");
    return results;
  }, [latestMeasurement, sex]);

  const chartData = useMemo(() => {
    const curve = getPercentileCurve(sex, activeTab);
    const patientPoints = measurements
      .map((m) => {
        let val: number | undefined;
        if (activeTab === "weight") val = m.weight;
        else if (activeTab === "height") val = m.height;
        else val = m.headCircumference;
        return val !== undefined ? { age: m.ageMonths, patient: val } : null;
      })
      .filter(Boolean) as { age: number; patient: number }[];

    const allAges = new Set<number>();
    curve.forEach((p) => allAges.add(p.age));
    patientPoints.forEach((p) => allAges.add(p.age));
    const sortedAges = Array.from(allAges).sort((a, b) => a - b);

    return sortedAges.map((age) => {
      const refPoint = curve.reduce((prev, curr) =>
        Math.abs(curr.age - age) < Math.abs(prev.age - age) ? curr : prev
      );
      const refFrac = curve.length > 1 ? (() => {
        let lo = curve[0], hi = curve[curve.length - 1];
        for (let i = 0; i < curve.length - 1; i++) {
          if (curve[i].age <= age && curve[i + 1].age >= age) {
            lo = curve[i]; hi = curve[i + 1]; break;
          }
        }
        if (lo.age === hi.age) return lo.values;
        const f = (age - lo.age) / (hi.age - lo.age);
        const interp: Record<string, number> = {};
        for (const key of Object.keys(lo.values)) {
          interp[key] = Math.round((lo.values[key] + f * (hi.values[key] - lo.values[key])) * 10) / 10;
        }
        return interp;
      })() : refPoint.values;

      const pp = patientPoints.find((p) => p.age === age);
      return { age, ...refFrac, patient: pp?.patient };
    });
  }, [sex, activeTab, measurements]);

  const handleAddMeasurement = () => {
    if (!selectedChild) return;
    const ageMonths = getAgeMonthsAtDate(selectedChild.birthDate, formDate);
    const m: GrowthMeasurement = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
      childId: selectedChildId,
      date: formDate,
      ageMonths,
      weight: formWeight ? parseFloat(formWeight) : undefined,
      height: formHeight ? parseFloat(formHeight) : undefined,
      headCircumference: formHC ? parseFloat(formHC) : undefined,
    };
    saveGrowthMeasurement(m);
    hapticNotification("success");
    setShowAddForm(false);
    setFormWeight("");
    setFormHeight("");
    setFormHC("");
  };

  const handleDeleteMeasurement = (id: string) => {
    hapticImpact("medium");
    deleteGrowthMeasurement(id);
    setRefreshKey((k) => k + 1);
  };

  if (children.length === 0) {
    return (
      <MobileContainer>
        <div className="h-full flex flex-col">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
            </button>
            <h1 className="text-lg font-bold text-[#1A1A1A]">Growth Tracker</h1>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <TrendingUp className="w-16 h-16 text-[#E0E0E0]" />
            <h2 className="text-lg font-bold text-[#1A1A1A]">No children added yet</h2>
            <p className="text-sm text-[#666666]">Add a child first to start tracking growth measurements.</p>
            <button
              onClick={() => navigate("/add-child")}
              className="px-6 py-3 bg-[#1A73E8] text-white rounded-xl font-semibold active:scale-[0.98] transition-transform"
            >
              Add Child
            </button>
          </div>
          <TabBar />
        </div>
      </MobileContainer>
    );
  }

  const tabColor = TAB_CONFIG[activeTab].color;

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1A1A1A]">Growth Tracker</h1>
            <p className="text-xs text-[#999999]">WHO Growth Standards</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {children.length > 1 && (
            <select
              value={selectedChildId}
              onChange={(e) => { hapticSelection(); setSelectedChildId(e.target.value); }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
          )}

          {selectedChild && (
            <div className="bg-gradient-to-r from-[#E8F0FE] to-[#E8F5E8] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">{selectedChild.displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-bold text-[#1A1A1A]">{selectedChild.displayName}</p>
                <p className="text-xs text-[#666666]">{currentAge} months · {sex === "male" ? "Boy" : "Girl"} · {measurements.length} measurement{measurements.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          )}

          {latestZScores && (
            <div className="grid grid-cols-3 gap-2">
              {(["weight", "height", "headCircumference"] as MeasureTab[]).map((type) => {
                const zResult = latestZScores[type];
                if (!zResult) return (
                  <div key={type} className="bg-white border-2 border-gray-100 rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-[#999] uppercase mb-1">{TAB_CONFIG[type].label}</p>
                    <p className="text-sm text-[#CCC]">—</p>
                  </div>
                );
                return (
                  <motion.div
                    key={type}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white border-2 rounded-2xl p-3 text-center"
                    style={{ borderColor: CLASSIFICATION_COLORS[zResult.classification] }}
                  >
                    <p className="text-[10px] text-[#999] uppercase mb-1">{TAB_CONFIG[type].label}</p>
                    <p className="text-xl font-extrabold" style={{ color: CLASSIFICATION_COLORS[zResult.classification] }}>
                      {zResult.percentile}<span className="text-xs">th</span>
                    </p>
                    <p className="text-[10px] text-[#999]">Z: {zResult.zscore > 0 ? "+" : ""}{zResult.zscore}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["weight", "height", "headCircumference"] as MeasureTab[]).map((tab) => {
              const cfg = TAB_CONFIG[tab];
              const Icon = cfg.icon;
              return (
                <button
                  key={tab}
                  onClick={() => { hapticSelection(); setActiveTab(tab); }}
                  className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab ? "bg-white shadow-sm text-[#1A1A1A]" : "text-[#999]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1A1A1A]">{TAB_CONFIG[activeTab].label} for Age ({TAB_CONFIG[activeTab].unit})</h3>
              <span className="text-[10px] text-[#999] uppercase">{sex === "male" ? "Boys" : "Girls"}</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="age"
                  stroke="#999"
                  style={{ fontSize: "10px" }}
                  label={{ value: "Age (months)", position: "insideBottom", offset: -10, style: { fontSize: "10px", fill: "#999" } }}
                />
                <YAxis stroke="#999" style={{ fontSize: "10px" }} width={35} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="minus2sd" stackId="band" fill="transparent" stroke="none" />
                <Area type="monotone" dataKey="plus2sd" stackId="band" fill={tabColor + "10"} stroke="none" />
                <Line type="monotone" dataKey="minus2sd" stroke="#EA4335" strokeWidth={1} strokeDasharray="4 4" dot={false} name="-2 SD" />
                <Line type="monotone" dataKey="minus1sd" stroke="#FBBC05" strokeWidth={1} strokeDasharray="3 3" dot={false} name="-1 SD" />
                <Line type="monotone" dataKey="median" stroke="#666" strokeWidth={1.5} dot={false} name="Median" />
                <Line type="monotone" dataKey="plus1sd" stroke="#FBBC05" strokeWidth={1} strokeDasharray="3 3" dot={false} name="+1 SD" />
                <Line type="monotone" dataKey="plus2sd" stroke="#EA4335" strokeWidth={1} strokeDasharray="4 4" dot={false} name="+2 SD" />
                <Line
                  type="monotone"
                  dataKey="patient"
                  stroke={tabColor}
                  strokeWidth={3}
                  dot={{ r: 4, fill: tabColor, stroke: "white", strokeWidth: 2 }}
                  name="Child"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 mt-2">
              {[
                { label: "Child", color: tabColor, dash: false },
                { label: "Median", color: "#666", dash: false },
                { label: "±2 SD", color: "#EA4335", dash: true },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="w-4 h-0.5 rounded" style={{ backgroundColor: l.color, borderTop: l.dash ? "1px dashed " + l.color : "none" }} />
                  <span className="text-[9px] text-[#999]">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {measurements.length > 0 && (
            <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => { hapticSelection(); setExpandedHistory(!expandedHistory); }}
                className="w-full flex items-center justify-between p-4"
              >
                <h3 className="text-sm font-bold text-[#1A1A1A]">Measurement History ({measurements.length})</h3>
                {expandedHistory ? <ChevronUp className="w-4 h-4 text-[#999]" /> : <ChevronDown className="w-4 h-4 text-[#999]" />}
              </button>
              <AnimatePresence>
                {expandedHistory && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-2">
                      {[...measurements].reverse().map((m) => (
                        <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                          <div>
                            <p className="text-xs font-semibold text-[#1A1A1A]">{new Date(m.date).toLocaleDateString()} · {m.ageMonths}mo</p>
                            <div className="flex gap-3 mt-1">
                              {m.weight && <span className="text-[10px] text-[#666]">W: {m.weight} kg</span>}
                              {m.height && <span className="text-[10px] text-[#666]">H: {m.height} cm</span>}
                              {m.headCircumference && <span className="text-[10px] text-[#666]">HC: {m.headCircumference} cm</span>}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteMeasurement(m.id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#EA4335] active:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white border-2 border-[#1A73E8] rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-[#1A1A1A]">New Measurement</h3>
                  <div>
                    <label className="text-xs text-[#666] block mb-1">Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-[#666] block mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formWeight}
                        onChange={(e) => setFormWeight(e.target.value)}
                        placeholder="e.g. 10.5"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#666] block mb-1">Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formHeight}
                        onChange={(e) => setFormHeight(e.target.value)}
                        placeholder="e.g. 75.0"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#666] block mb-1">Head (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formHC}
                        onChange={(e) => setFormHC(e.target.value)}
                        placeholder="e.g. 46.0"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { hapticSelection(); setShowAddForm(false); }}
                      className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-[#666] active:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMeasurement}
                      disabled={!formWeight && !formHeight && !formHC}
                      className="flex-1 py-2.5 bg-[#1A73E8] text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-40"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-5 py-3 border-t border-gray-100" style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}>
          <button
            onClick={() => { hapticImpact("medium"); setShowAddForm(!showAddForm); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#1A73E8] to-[#4285F4] text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform shadow-md min-h-[56px]"
          >
            <Plus className="w-5 h-5" />
            Add Measurement
          </button>
        </div>
        <DisclaimerFooter />
        <TabBar />
      </div>
    </MobileContainer>
  );
}
