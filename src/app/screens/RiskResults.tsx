import { useNavigate, useParams } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { RiskBanner } from "../components/RiskBanner";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, Phone, Share2, FileText, TrendingDown } from "lucide-react";
import { mockPatients } from "../data/mockData";
import { motion } from "motion/react";

export function RiskResults() {
  const navigate = useNavigate();
  const { id } = useParams();
  const patient = mockPatients.find((p) => p.id === id) || mockPatients[0];

  return (
    <MobileContainer>
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Risk Assessment</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Risk Banner */}
          <RiskBanner risk={patient.risk} />

          {/* Patient Info */}
          <div className="bg-[#F8F9FA] rounded-2xl p-5">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-3">
              {patient.id} • {patient.age} {patient.gender}
            </h2>
            <p className="text-[#666666]">{patient.condition}</p>
            <p className="text-sm text-[#999999] mt-2">
              Screened: {new Date(patient.timestamp).toLocaleDateString()}
            </p>
          </div>

          {/* MedGemma Insights */}
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">MedGemma Insights</h3>
            <div className="space-y-4">
              {/* Confidence */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#666666]">Confidence</span>
                  <span className="text-2xl font-bold text-[#34A853]">{patient.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#34A853] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${patient.confidence}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* ASQ-3 Score */}
              {patient.asqScore && (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#666666]">ASQ-3 Score</span>
                    <span className="text-2xl font-bold text-[#EA4335]">{patient.asqScore}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-[#EA4335]" />
                    <span className="text-sm text-[#EA4335]">Below expected range</span>
                  </div>
                </div>
              )}

              {/* Z-Score */}
              {patient.zScore && (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#666666]">Z-Score</span>
                    <span className="text-2xl font-bold text-[#EA4335]">{patient.zScore}</span>
                  </div>
                  <p className="text-sm text-[#999999] mt-2">WHO Growth Curve</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Clinical Recommendations</h3>
            <div className="space-y-3">
              <div className="bg-[#EA4335]/10 border-l-4 border-[#EA4335] rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#EA4335] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-[#EA4335]">IMMEDIATE</p>
                    <p className="text-[#1A1A1A] mt-1">Speech Therapist Referral</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FF9800]/10 border-l-4 border-[#FF9800] rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#FF9800] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-[#FF9800]">URGENT (7 days)</p>
                    <p className="text-[#1A1A1A] mt-1">Audiology Assessment</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FBBC05]/10 border-l-4 border-[#FBBC05] rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#FBBC05] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-[#FBBC05]">FOLLOW-UP (30 days)</p>
                    <p className="text-[#1A1A1A] mt-1">Repeat ASQ-3 Screening</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <PrimaryButton variant="destructive" onClick={() => {}}>
              <Phone className="w-5 h-5 mr-2 inline" />
              Call
            </PrimaryButton>
            <PrimaryButton variant="primary" onClick={() => {}}>
              <Share2 className="w-5 h-5 mr-2 inline" />
              Share
            </PrimaryButton>
          </div>
          <PrimaryButton variant="secondary" onClick={() => navigate(`/longitudinal/${patient.id}`)}>
            <FileText className="w-5 h-5 mr-2 inline" />
            Generate PDF Report
          </PrimaryButton>
        </div>
      </div>
    </MobileContainer>
  );
}
