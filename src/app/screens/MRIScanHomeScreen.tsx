import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { useEdgeStatus } from "../edge/EdgeStatusContext";
import {
  ArrowLeft, FolderOpen, BarChart3, Shield, Brain,
  Activity, Scan, Waves, ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import type { MRIScanType } from "../mri/mriTypes";

const MRI_USE_CASES = [
  {
    icon: Brain,
    label: "Brain Age Gap",
    desc: "Neurodevelopmental delay assessment via volumetric analysis",
    sequence: "T1_MPRAGE" as MRIScanType,
    color: "#1A73E8",
  },
  {
    icon: Activity,
    label: "White Matter Tracts",
    desc: "DTI fractional anisotropy for connectivity mapping",
    sequence: "DTI" as MRIScanType,
    color: "#9C27B0",
  },
  {
    icon: Waves,
    label: "Myelination Score",
    desc: "T2-based myelination progression tracking",
    sequence: "T2_SPACE" as MRIScanType,
    color: "#34A853",
  },
  {
    icon: Scan,
    label: "Ventriculomegaly",
    desc: "CSF/brain volume ratio for hydrocephalus screening",
    sequence: "FLAIR" as MRIScanType,
    color: "#E91E63",
  },
];

export function MRIScanHomeScreen() {
  const navigate = useNavigate();
  const { ready } = useEdgeStatus();

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-[#E3F2FD] to-[#F5F5F5] pb-8">
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">MRI Brain Analysis</h1>
            <p className="text-sm text-[#666666]">Radiation-Free Pediatric Imaging</p>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#2E7D32] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-[#1A1A1A] font-medium">No Radiation · Local Processing</p>
                <p className="text-xs text-[#666666] mt-1">
                  MRI provides superior soft tissue contrast without ionizing radiation.
                  All data processed on-device using MedGemma-MRI-NeuroNet (150MB). No cloud upload.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/mri-import")}
            className="w-full bg-gradient-to-r from-[#1565C0] to-[#1A73E8] rounded-2xl p-5 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FolderOpen className="w-5 h-5 text-white" />
                  <span className="text-white text-lg font-bold">New MRI Analysis</span>
                </div>
                <p className="text-white/80 text-sm">
                  T1/T2/DTI sequences · Brain age · White matter · No radiation
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/60" />
            </div>
            <div className="flex gap-3 mt-3">
              <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium">~1.8s inference</span>
              <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium">150MB model</span>
              <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium">~15min scan</span>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/mri-serial")}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[#1565C0]" />
              <div>
                <p className="font-semibold text-[#1A1A1A]">Brain Age Tracking</p>
                <p className="text-xs text-[#666666]">Longitudinal analysis across multiple MRI studies</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#999999]" />
          </motion.button>
        </div>

        <div className="px-4">
          <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider mb-3">
            Clinical Use Cases
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MRI_USE_CASES.map((uc) => (
              <motion.button
                key={uc.label}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/mri-import?sequence=${uc.sequence}`)}
                className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${uc.color}15` }}
                >
                  <uc.icon className="w-5 h-5" style={{ color: uc.color }} />
                </div>
                <p className="font-semibold text-[#1A1A1A] text-sm">{uc.label}</p>
                <p className="text-xs text-[#666666] mt-1">{uc.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="px-4 mt-6">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4">
            <h3 className="font-semibold text-[#1A1A1A] text-sm mb-2">MRI Sequences</h3>
            <div className="space-y-2 text-sm text-[#666666]">
              <p>• 3D T1 MPRAGE — volumetric, cortical thickness (~4min)</p>
              <p>• 3D T2 SPACE — myelination, CSF contrast (~5min)</p>
              <p>• DTI — white matter tract integrity, FA maps (~6min)</p>
              <p>• Total: ~15min with AI motion correction</p>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4">
            <h3 className="font-semibold text-[#1A1A1A] text-sm mb-2">Pipeline Overview</h3>
            <div className="space-y-2">
              {[
                { step: "1", label: "Import", desc: "DICOM MRI sequence selection" },
                { step: "2", label: "Motion Correct", desc: "AI denoising + slice registration" },
                { step: "3", label: "Inference", desc: "NeuroNet brain age + domain scoring" },
                { step: "4", label: "Visualize", desc: "Multiplanar viewer with brain age gauge" },
                { step: "5", label: "Report", desc: "Risk amplification + FHIR R4 export" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1565C0] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{s.step}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#1A1A1A]">{s.label}</span>
                    <span className="text-xs text-[#666666] ml-2">{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="bg-[#FFF3E0] border border-[#FFE0B2] rounded-2xl p-3">
            <p className="text-xs text-[#666666]">
              <strong>Target scanners:</strong> Siemens Magnetom Vida 3T, GE SIGNA Premier,
              Philips Ingenia Elition. AI motion correction reduces sedation needs by up to 75%.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#999999] mt-6 px-4">
          MedGemma MRI NeuroNet v1.2.0 · Not a diagnostic tool
        </p>
      </div>
    </MobileContainer>
  );
}
