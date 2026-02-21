import { useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Download, Share2, Printer, QrCode, User, Calendar, ChevronDown } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { MobileContainer } from "../components/MobileContainer";
import { TabBar } from "../components/TabBar";
import { useApp } from "../context/AppContext";
import { encodeChildQR, encodeScreeningQR } from "../platform/qrUtils";
import { hapticImpact, hapticNotification } from "../platform/haptics";
import { motion, AnimatePresence } from "motion/react";
import { RISK_LABELS, RISK_COLORS } from "../data/types";

function getAgeText(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) return "Newborn";
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}m` : `${years}y`;
}

type CardMode = "patient" | "screening";

export function QRPatientCard() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const { children, getResultsForChild } = useApp();
  const [mode, setMode] = useState<CardMode>("patient");
  const [selectedResultIdx, setSelectedResultIdx] = useState(0);
  const [showShared, setShowShared] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const child = children.find((c) => c.id === childId);
  const results = child ? getResultsForChild(child.id) : [];
  const selectedResult = results[selectedResultIdx];

  if (!child) {
    return (
      <MobileContainer>
        <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
          <QrCode className="w-16 h-16 text-[#E0E0E0]" />
          <h2 className="text-lg font-bold">Child not found</h2>
          <button onClick={() => navigate("/children")} className="text-[#1A73E8] font-semibold">Go to Children</button>
        </div>
      </MobileContainer>
    );
  }

  const qrValue = mode === "patient"
    ? encodeChildQR(child)
    : selectedResult
      ? encodeScreeningQR(selectedResult, child.displayName)
      : encodeChildQR(child);

  const handleShare = async () => {
    hapticImpact("medium");
    const shareText = mode === "patient"
      ? `PediScreen AI - Patient Card\n${child.displayName}\nDOB: ${child.birthDate}\nScan QR code to access record`
      : selectedResult
        ? `PediScreen AI - Screening Result\n${child.displayName} (${selectedResult.ageMonths}mo)\nRisk: ${RISK_LABELS[selectedResult.overallRisk]}\nDate: ${new Date(selectedResult.createdAt).toLocaleDateString()}`
        : "";

    if (navigator.share) {
      try {
        await navigator.share({ title: "PediScreen AI", text: shareText });
        hapticNotification("success");
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      hapticNotification("success");
      setShowShared(true);
      setTimeout(() => setShowShared(false), 2000);
    }
  };

  const handlePrint = () => {
    hapticImpact("light");
    window.print();
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1A1A1A]">QR Patient Card</h1>
            <p className="text-xs text-[#999]">Scan to access record</p>
          </div>
          <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100">
            <Share2 className="w-5 h-5 text-[#1A73E8]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["patient", "screening"] as CardMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { hapticImpact("light"); setMode(m); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === m ? "bg-white shadow-sm text-[#1A1A1A]" : "text-[#999]"
                }`}
              >
                {m === "patient" ? "Patient ID" : "Screening Result"}
              </button>
            ))}
          </div>

          <motion.div
            ref={cardRef}
            key={mode + selectedResultIdx}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-lg print:shadow-none"
          >
            <div className={`px-5 py-4 text-white ${
              mode === "patient"
                ? "bg-gradient-to-r from-[#1A73E8] to-[#4285F4]"
                : selectedResult
                  ? `bg-gradient-to-r`
                  : "bg-gray-400"
            }`} style={mode === "screening" && selectedResult ? {
              background: `linear-gradient(135deg, ${RISK_COLORS[selectedResult.overallRisk]}CC, ${RISK_COLORS[selectedResult.overallRisk]})`
            } : undefined}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  {mode === "patient" ? <User className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wider">
                    {mode === "patient" ? "PediScreen AI - Patient ID" : "PediScreen AI - Screening"}
                  </p>
                  <p className="font-bold text-lg">{child.displayName}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-5 flex flex-col items-center">
              <div className="bg-white p-3 rounded-2xl border-2 border-gray-100 shadow-sm">
                <QRCodeSVG
                  value={qrValue}
                  size={180}
                  level="M"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#1A1A1A"
                />
              </div>

              <p className="text-[10px] text-[#999] mt-3 text-center">
                Scan with PediScreen AI app to access record
              </p>

              <div className="w-full mt-4 space-y-2">
                {mode === "patient" ? (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-[#666]">Name</span>
                      <span className="text-sm font-semibold text-[#1A1A1A]">{child.displayName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-[#666]">Date of Birth</span>
                      <span className="text-sm font-semibold text-[#1A1A1A]">{new Date(child.birthDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-[#666]">Age</span>
                      <span className="text-sm font-semibold text-[#1A1A1A]">{getAgeText(child.birthDate)}</span>
                    </div>
                    {child.sex && child.sex !== "prefer_not_to_say" && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-xs text-[#666]">Sex</span>
                        <span className="text-sm font-semibold text-[#1A1A1A] capitalize">{child.sex}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-[#666]">Patient ID</span>
                      <span className="text-xs font-mono text-[#999]">{child.id}</span>
                    </div>
                  </>
                ) : selectedResult ? (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-[#666]">Overall Risk</span>
                      <span className="text-sm font-bold" style={{ color: RISK_COLORS[selectedResult.overallRisk] }}>
                        {RISK_LABELS[selectedResult.overallRisk]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-[#666]">Age at Screening</span>
                      <span className="text-sm font-semibold">{selectedResult.ageMonths} months</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-[#666]">Date</span>
                      <span className="text-sm font-semibold">{new Date(selectedResult.createdAt).toLocaleDateString()}</span>
                    </div>
                    {selectedResult.domainRisks.map((dr) => (
                      <div key={dr.domain} className="flex justify-between items-center py-1.5">
                        <span className="text-xs text-[#666] capitalize">{dr.domain.replace("_", " ")}</span>
                        <span className="text-xs font-semibold" style={{ color: RISK_COLORS[dr.risk] }}>
                          {dr.score}/{dr.maxScore}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-[#999]">No screenings completed yet</p>
                    <button onClick={() => navigate(`/child/${child.id}/screening-intro`)} className="text-sm text-[#1A73E8] font-semibold mt-2">
                      Start Screening
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {mode === "screening" && results.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs text-[#666] font-semibold">Select Screening</p>
              {results.map((r, i) => (
                <button
                  key={r.sessionId}
                  onClick={() => { hapticImpact("light"); setSelectedResultIdx(i); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                    i === selectedResultIdx ? "border-[#1A73E8] bg-[#E8F0FE]" : "border-gray-100 bg-white"
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1A]">{new Date(r.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-[#666]">{r.ageMonths} months</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: RISK_COLORS[r.overallRisk] }}>
                    {RISK_LABELS[r.overallRisk]}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 bg-[#1A73E8] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-[#1A1A1A] rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showShared && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-5 py-3 rounded-full text-sm font-semibold shadow-lg z-50"
            >
              Copied to clipboard
            </motion.div>
          )}
        </AnimatePresence>

        <TabBar />
      </div>
    </MobileContainer>
  );
}
