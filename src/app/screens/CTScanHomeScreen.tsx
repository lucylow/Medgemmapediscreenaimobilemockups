import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { useEdgeStatus } from "../edge/EdgeStatusContext";
import {
  ArrowLeft, FolderOpen, BarChart3, Shield, Brain,
  Bone, Heart, Microscope, ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import { CT_MODALITY_LABELS } from "../ct/ctTypes";
import type { CTModality } from "../ct/ctTypes";

const USE_CASES = [
  { icon: Brain, label: "Preemie IVH", desc: "CT head for intraventricular hemorrhage grading", modality: "CT_HEAD" as CTModality, color: "#E91E63" },
  { icon: Bone, label: "Pediatric Fractures", desc: "Complex fracture detection and classification", modality: "CT_MS" as CTModality, color: "#FF9800" },
  { icon: Heart, label: "Abdominal Emergency", desc: "NEC, appendicitis, bowel obstruction", modality: "CT_ABDOMEN" as CTModality, color: "#9C27B0" },
  { icon: Microscope, label: "Oncology Staging", desc: "Neuroblastoma, Wilms, lymphoma assessment", modality: "CT_CHEST" as CTModality, color: "#1A73E8" },
];

export function CTScanHomeScreen() {
  const navigate = useNavigate();
  const { ready } = useEdgeStatus();

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-[#E0F7FA] to-[#F5F5F5] pb-8">
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">CT Scan Analysis</h1>
            <p className="text-sm text-[#666666]">Edge AI Pediatric Imaging</p>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="bg-[#FFF3E0] border border-[#FFE0B2] rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#E65100] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-[#1A1A1A] font-medium">Offline CT Analysis</p>
                <p className="text-xs text-[#666666] mt-1">
                  All CT data stays on-device. DICOM/NIfTI files are processed locally using
                  MedGemma-2B-IT-Q4 (120MB). No cloud upload required.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/ct-import")}
            className="w-full bg-gradient-to-r from-[#00838F] to-[#006064] rounded-2xl p-5 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FolderOpen className="w-5 h-5 text-white" />
                  <span className="text-white text-lg font-bold">New CT Analysis</span>
                </div>
                <p className="text-white/80 text-sm">
                  Import DICOM or NIfTI from this device, or run a demo volume.
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/60" />
            </div>
            <div className="flex gap-3 mt-3">
              <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium">~2.1s inference</span>
              <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium">120MB model</span>
              <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium">450MB peak</span>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/ct-serial")}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[#00838F]" />
              <div>
                <p className="font-semibold text-[#1A1A1A]">Serial CT Comparison</p>
                <p className="text-xs text-[#666666]">Track risk progression across multiple studies</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#999999]" />
          </motion.button>
        </div>

        <div className="px-4">
          <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider mb-3">
            Supported Pediatric Use Cases
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {USE_CASES.map((uc) => (
              <motion.button
                key={uc.label}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/ct-import?modality=${uc.modality}`)}
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
            <h3 className="font-semibold text-[#1A1A1A] text-sm mb-2">Pipeline Overview</h3>
            <div className="space-y-2">
              {[
                { step: "1", label: "Import", desc: "DICOM/NIfTI file selection" },
                { step: "2", label: "Preprocess", desc: "512x512xN → 64x64x64 patches, HU normalize" },
                { step: "3", label: "Inference", desc: "MedGemma-2B-IT-Q4 patch-wise analysis" },
                { step: "4", label: "Visualize", desc: "Axial/coronal/sagittal multiplanar view" },
                { step: "5", label: "Report", desc: "Risk tier + FHIR R4 bundle export" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00838F] flex items-center justify-center shrink-0">
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

        <p className="text-center text-xs text-[#999999] mt-6 px-4">
          MedGemma CT 2B-IT Q4 v1.0.0 · Not a diagnostic tool
        </p>
      </div>
    </MobileContainer>
  );
}
