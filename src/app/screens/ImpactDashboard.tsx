import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, DollarSign, Users, TrendingUp, Award, Download, Share2 } from "lucide-react";
import { impactMetrics, chwLeaderboard } from "../data/mockData";
import { motion } from "motion/react";
import { PrimaryButton } from "../components/PrimaryButton";

export function ImpactDashboard() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#1A73E8] to-[#34A853] px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Impact Dashboard</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Hero Impact Metrics */}
          <div className="space-y-4">
            <motion.div
              className="bg-gradient-to-br from-[#34A853] to-[#1A73E8] rounded-3xl p-6 text-white shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-7 h-7" />
                </div>
                <span className="text-lg">Lifetime Savings</span>
              </div>
              <motion.div
                className="text-5xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ${impactMetrics.lifetimeSavings}M
              </motion.div>
              <p className="text-white/80 mt-2">Total healthcare cost reduction</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="bg-white border-2 border-gray-200 rounded-2xl p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-[#1A73E8]" />
                  <span className="text-sm text-[#666666]">Children</span>
                </div>
                <div className="text-3xl font-bold text-[#1A1A1A]">
                  {impactMetrics.childrenScreened.toLocaleString()}
                </div>
              </motion.div>

              <motion.div
                className="bg-white border-2 border-gray-200 rounded-2xl p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-[#34A853]" />
                  <span className="text-sm text-[#666666]">Detection</span>
                </div>
                <div className="text-3xl font-bold text-[#34A853]">
                  {impactMetrics.earlyDetectionRate}%
                </div>
              </motion.div>
            </div>
          </div>

          {/* CHW Leaderboard */}
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-[#FF9800]" />
              CHW Leaderboard
            </h3>
            <div className="space-y-3">
              {chwLeaderboard.map((chw, index) => (
                <motion.div
                  key={chw.name}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                      index === 0
                        ? "bg-[#FF9800] text-white"
                        : index === 1
                        ? "bg-[#E0E0E0] text-[#666666]"
                        : index === 2
                        ? "bg-[#CD7F32] text-white"
                        : "bg-[#F8F9FA] text-[#999999]"
                    }`}
                  >
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#1A1A1A]">{chw.name}</h4>
                    <p className="text-sm text-[#666666]">{chw.screenings} screenings</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#34A853]">${chw.savings}M</p>
                    <p className="text-xs text-[#666666]">saved</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Program Overview */}
          <div className="bg-gradient-to-br from-[#1A73E8] to-[#9C27B0] rounded-3xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Program Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/80">Active CHWs</span>
                <span className="font-bold">{impactMetrics.totalCHWs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Avg. Cost per Child</span>
                <span className="font-bold">$10,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Avg. Savings per Child</span>
                <span className="font-bold text-[#34A853]">$100,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">ROI</span>
                <span className="font-bold text-[#FBBC05]">10:1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <PrimaryButton variant="primary" fullWidth={false}>
              <Download className="w-5 h-5 mr-2 inline" />
              Export CSV
            </PrimaryButton>
            <PrimaryButton variant="success" fullWidth={false}>
              <Share2 className="w-5 h-5 mr-2 inline" />
              Share QR
            </PrimaryButton>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
