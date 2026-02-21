import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { mockPatients, riskCounts } from "../data/mockData";
import { QrCode, Camera, RefreshCw, TrendingUp, Phone, Share2 } from "lucide-react";

const riskColors = {
  REFERRAL: "#EA4335",
  URGENT: "#FF9800",
  MONITOR: "#FBBC05",
  "ON-TRACK": "#34A853",
};

export function Dashboard() {
  const navigate = useNavigate();
  const highRiskPatients = mockPatients.filter(p => p.risk === "REFERRAL" || p.risk === "URGENT");

  return (
    <MobileContainer>
      <div className="h-full overflow-y-auto">
        {/* Header - 48px */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">CHW Maria</h1>
              <p className="text-sm text-[#666666]">47 Screenings Today</p>
            </div>
            <button
              onClick={() => navigate("/impact")}
              className="w-10 h-10 bg-[#1A73E8] rounded-full flex items-center justify-center"
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Risk Hero Row - 96px Cards */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-4 gap-3 mb-6">
            {Object.entries(riskCounts).map(([risk, count]) => (
              <div
                key={risk}
                className="h-[96px] rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer active:scale-95 transition-transform"
                style={{ backgroundColor: riskColors[risk as keyof typeof riskColors] }}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs mt-1 text-center px-1">{risk.split('-').join(' ')}</div>
              </div>
            ))}
          </div>

          {/* Recent High-Risk List */}
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">High Priority Patients</h2>
          <div className="space-y-3 mb-6">
            {highRiskPatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white border-l-4 rounded-2xl p-4 shadow-md cursor-pointer active:scale-[0.98] transition-transform"
                style={{ borderColor: riskColors[patient.risk] }}
                onClick={() => navigate(`/patient/${patient.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-[#1A1A1A]">
                      {patient.id} • {patient.age} {patient.gender}
                    </h3>
                    <p className="text-sm text-[#666666] mt-1">{patient.condition}</p>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: riskColors[patient.risk] }}
                  >
                    {patient.risk}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 h-[48px] bg-[#EA4335] text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm">
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                  <button className="flex-1 h-[48px] bg-[#1A73E8] text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Thumb Zone 35% */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/qr-scanner")}
              className="h-[72px] bg-[#1A73E8] text-white rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <QrCode className="w-6 h-6" />
              <span className="text-xs font-semibold">Scan QR</span>
            </button>
            <button
              onClick={() => navigate("/new-screening")}
              className="h-[72px] bg-[#34A853] text-white rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs font-semibold">New Screening</span>
            </button>
            <button className="h-[72px] bg-[#666666] text-white rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
              <RefreshCw className="w-6 h-6" />
              <span className="text-xs font-semibold">Sync 72h</span>
            </button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
