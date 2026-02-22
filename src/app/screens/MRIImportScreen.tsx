import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { useEdgeStatus } from "../edge/EdgeStatusContext";
import {
  ArrowLeft, Upload, Play, Loader2,
  CheckCircle2, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { hapticImpact, hapticNotification } from "../platform/haptics";
import { pickMRIFile, loadMRIVolumeFromFile, generateDemoMRIVolume } from "../mri/mriLoader";
import { extractMRIPatches3D, applyMotionCorrection } from "../mri/mriPreprocess";
import type { MRIVolume, MRIScanType, MRIInferenceResult } from "../mri/mriTypes";
import { MRI_SCAN_LABELS, MRI_RISK_COLORS, MRI_RISK_LABELS } from "../mri/mriTypes";

type ImportStep = "select" | "loading" | "motion" | "preprocessing" | "inference" | "done" | "error";

const SEQUENCES: MRIScanType[] = ["T1_MPRAGE", "T2_SPACE", "DTI", "SWI", "FLAIR", "CISS", "ASL", "fMRI"];

export function MRIImportScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { engine } = useEdgeStatus();

  const presetSequence = searchParams.get("sequence") as MRIScanType | null;
  const [sequence, setSequence] = useState<MRIScanType>(presetSequence ?? "T1_MPRAGE");
  const [patientAge, setPatientAge] = useState(24);
  const [step, setStep] = useState<ImportStep>("select");
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState<MRIVolume | null>(null);
  const [result, setResult] = useState<MRIInferenceResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const runPipeline = useCallback(async (vol: MRIVolume) => {
    try {
      setStep("motion");
      setProgress(25);
      hapticImpact("light");

      const { corrected } = applyMotionCorrection(vol);
      setProgress(35);

      setStep("preprocessing");
      setProgress(40);
      const patches = extractMRIPatches3D(corrected);
      setProgress(50);

      setStep("inference");
      setProgress(60);

      if (!engine) {
        throw new Error("Edge AI engine not initialized");
      }

      const inferenceResult = await engine.runMRIAnalysis({
        volumeMeta: corrected.meta,
        patchData: patches,
        childAgeMonths: corrected.meta.patientAgeMonths,
        sequences: [corrected.meta.modality],
      });

      if (!inferenceResult) {
        throw new Error("MRI analysis not available in current runtime");
      }

      setResult(inferenceResult);
      setVolume(corrected);
      setProgress(100);
      setStep("done");
      hapticNotification("success");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Pipeline failed");
      setStep("error");
      hapticNotification("error");
    }
  }, [engine]);

  const handleFileImport = async () => {
    try {
      setStep("loading");
      setProgress(10);

      const file = await pickMRIFile();
      if (!file) {
        setStep("select");
        return;
      }

      setProgress(20);
      const vol = await loadMRIVolumeFromFile(file, sequence, patientAge);
      setVolume(vol);
      await runPipeline(vol);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Import failed");
      setStep("error");
    }
  };

  const handleDemoRun = async () => {
    try {
      setStep("loading");
      setProgress(15);
      hapticImpact("medium");

      const vol = generateDemoMRIVolume(sequence, patientAge);
      setVolume(vol);
      setProgress(20);
      await runPipeline(vol);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Demo failed");
      setStep("error");
    }
  };

  const handleViewResults = () => {
    if (volume && result) {
      navigate("/mri-viewer", {
        state: { volume, result },
      });
    }
  };

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-[#E3F2FD] to-[#F5F5F5] pb-8">
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Import MRI Study</h1>
            <p className="text-sm text-[#666666]">DICOM / NIfTI · Radiation-free · Local only</p>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {step === "select" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                <label className="text-sm font-semibold text-[#1A1A1A] block mb-2">MRI Sequence</label>
                <select
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value as MRIScanType)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-[#1A1A1A]"
                >
                  {SEQUENCES.map((s) => (
                    <option key={s} value={s}>{MRI_SCAN_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                <label className="text-sm font-semibold text-[#1A1A1A] block mb-2">
                  Patient Age: {patientAge} months
                </label>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={patientAge}
                  onChange={(e) => setPatientAge(parseInt(e.target.value))}
                  className="w-full accent-[#1565C0]"
                />
                <div className="flex justify-between text-xs text-[#999] mt-1">
                  <span>0 months</span>
                  <span>60 months</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleFileImport}
                className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E3F2FD] flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#1565C0]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A1A1A]">Choose MRI File</p>
                    <p className="text-xs text-[#666666] mt-1">
                      Select DICOM (.dcm) or NIfTI (.nii/.nii.gz) from device
                    </p>
                  </div>
                </div>
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-[#999999]">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleDemoRun}
                className="w-full bg-gradient-to-r from-[#1565C0] to-[#1A73E8] rounded-2xl p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Run Demo Analysis</p>
                    <p className="text-xs text-white/70 mt-1">
                      Simulated {MRI_SCAN_LABELS[sequence]} brain volume (64x64x64) for {patientAge}-month-old
                    </p>
                  </div>
                </div>
              </motion.button>

              <div className="bg-[#FFF8E1] border border-[#FFF59D] rounded-2xl p-3">
                <p className="text-xs text-[#666666]">
                  <strong>Demo mode:</strong> Generates synthetic brain anatomy with tissue
                  segmentation (WM/GM/CSF/ventricles). In clinical use, real MRI DICOM data
                  from scanners like Siemens Vida 3T would be loaded.
                </p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {(step === "loading" || step === "motion" || step === "preprocessing" || step === "inference") && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-6 h-6 text-[#1565C0] animate-spin" />
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">
                      {step === "loading" && "Loading MRI data..."}
                      {step === "motion" && "AI Motion Correction..."}
                      {step === "preprocessing" && "Preprocessing volume..."}
                      {step === "inference" && "Running NeuroNet inference..."}
                    </p>
                    <p className="text-xs text-[#666666]">
                      {step === "loading" && "Reading DICOM MRI sequences"}
                      {step === "motion" && "Rigid registration + AI denoising (reduces sedation 60%→15%)"}
                      {step === "preprocessing" && "Normalizing intensity, extracting 64³ patches"}
                      {step === "inference" && "Brain age + WM integrity + myelination (~1.8s target)"}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-[#1565C0] to-[#42A5F5] h-3 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-[#999999] mt-2 text-right">{progress}%</p>
              </motion.div>
            )}

            {step === "done" && volume && result && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-white border-2 border-green-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <p className="font-bold text-[#1A1A1A]">MRI Analysis Complete</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[#666666]">Volume</p>
                      <p className="font-medium text-[#1A1A1A]">
                        {volume.meta.rows}x{volume.meta.cols}x{volume.meta.sliceCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#666666]">Sequence</p>
                      <p className="font-medium text-[#1A1A1A]">
                        {MRI_SCAN_LABELS[volume.meta.modality]}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#666666]">Brain Age Gap</p>
                      <p className="font-bold" style={{
                        color: Math.abs(result.domainScores.brainAgeGapMonths) > 2 ? "#EA4335" : "#34A853"
                      }}>
                        {result.domainScores.brainAgeGapMonths > 0 ? "+" : ""}{result.domainScores.brainAgeGapMonths.toFixed(1)}m
                      </p>
                    </div>
                    <div>
                      <p className="text-[#666666]">Risk</p>
                      <p className="font-bold" style={{
                        color: MRI_RISK_COLORS[result.riskAmplification]
                      }}>
                        {MRI_RISK_LABELS[result.riskAmplification]}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleViewResults}
                  className="w-full bg-gradient-to-r from-[#1565C0] to-[#1A73E8] rounded-2xl p-4 text-center"
                >
                  <span className="text-white font-bold text-lg">View Brain Analysis</span>
                </motion.button>

                <button
                  onClick={() => {
                    setStep("select");
                    setVolume(null);
                    setResult(null);
                    setProgress(0);
                  }}
                  className="w-full text-center text-sm text-[#1565C0] font-medium py-2"
                >
                  Run Another Analysis
                </button>
              </motion.div>
            )}

            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-2 border-red-200 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <p className="font-bold text-red-800">Analysis Failed</p>
                </div>
                <p className="text-sm text-red-700 mb-4">{errorMsg}</p>
                <button
                  onClick={() => {
                    setStep("select");
                    setErrorMsg("");
                    setProgress(0);
                  }}
                  className="text-sm text-[#1565C0] font-medium"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileContainer>
  );
}
