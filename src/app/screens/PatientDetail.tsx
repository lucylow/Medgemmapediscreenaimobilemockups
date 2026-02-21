import { useNavigate, useParams } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { RiskBanner } from "../components/RiskBanner";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, Phone, Video, MessageCircle, TrendingUp, FileText, Camera } from "lucide-react";
import { mockPatients } from "../data/mockData";

export function PatientDetail() {
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
          <h1 className="text-xl font-bold text-[#1A1A1A]">Patient Details</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Risk Banner */}
          <RiskBanner risk={patient.risk} />

          {/* Patient Info Card */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              {patient.id}
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#666666]">Age</p>
                <p className="font-semibold text-[#1A1A1A]">{patient.age}</p>
              </div>
              <div>
                <p className="text-[#666666]">Gender</p>
                <p className="font-semibold text-[#1A1A1A]">{patient.gender === "M" ? "Male" : "Female"}</p>
              </div>
              {patient.gestationalAge && (
                <div>
                  <p className="text-[#666666]">Gestational Age</p>
                  <p className="font-semibold text-[#1A1A1A]">{patient.gestationalAge}</p>
                </div>
              )}
              <div>
                <p className="text-[#666666]">Screened</p>
                <p className="font-semibold text-[#1A1A1A]">
                  {new Date(patient.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Condition */}
          <div className="bg-[#F8F9FA] rounded-2xl p-5">
            <h3 className="font-bold text-[#1A1A1A] mb-2">Primary Concern</h3>
            <p className="text-[#666666]">{patient.condition}</p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {}}
              className="h-[90px] bg-[#EA4335] text-white rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Phone className="w-6 h-6" />
              <span className="text-xs font-semibold">Call</span>
            </button>
            <button
              onClick={() => {}}
              className="h-[90px] bg-[#1A73E8] text-white rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Video className="w-6 h-6" />
              <span className="text-xs font-semibold">Video</span>
            </button>
            <button
              onClick={() => {}}
              className="h-[90px] bg-[#34A853] text-white rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-semibold">Message</span>
            </button>
          </div>

          {/* Medical Records */}
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Medical Records</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/results/${patient.id}`)}
                className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 bg-[#1A73E8] rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-[#1A1A1A]">Risk Assessment</p>
                  <p className="text-sm text-[#666666]">View detailed analysis</p>
                </div>
              </button>

              <button
                onClick={() => navigate(`/longitudinal/${patient.id}`)}
                className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 bg-[#34A853] rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-[#1A1A1A]">Growth Timeline</p>
                  <p className="text-sm text-[#666666]">6-month tracking</p>
                </div>
              </button>

              <button
                onClick={() => {}}
                className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 bg-[#FF9800] rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-[#1A1A1A]">Visual Evidence</p>
                  <p className="text-sm text-[#666666]">Photos & videos</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6">
          <PrimaryButton onClick={() => navigate("/new-screening")}>
            Schedule Follow-up Screening
          </PrimaryButton>
        </div>
      </div>
    </MobileContainer>
  );
}
