import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { useEdgeStatus } from "../edge/EdgeStatusContext";
import {
  ArrowLeft, Upload, FileText, Play, Loader2,
  CheckCircle2, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { hapticImpact, hapticNotification } from "../platform/haptics";
import { pickCTFile, loadCTVolumeFromFile, generateDemoVolume } from "../ct/dicomLoader";
import { extractPatches3D } from "../ct/ctPreprocess";
import type { CTVolume, CTModality, CTInferenceResult } from "../ct/ctTypes";
import { CT_MODALITY_LABELS } from "../ct/ctTypes";

type ImportStep = "select" | "loading" | "preprocessing" | "inference" | "done" | "error";

const MODALITIES: CTModality[] = ["CT_HEAD", "CT_ABDOMEN", "CT_CHEST", "CT_MS", "CBCT_DENTAL"];

export function CTImportScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { engine } = useEdgeStatus();

  const presetModality = searchParams.get("modality") as CTModality | null;
  const [modality, setModality] = useState<CTModality>(presetModality ?? "CT_HEAD");
  const [step, setStep] = useState<ImportStep>("select");
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState<CTVolume | null>(null);
  const [result, setResult] = useState<CTInferenceResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const runPipeline = useCallback(async (vol: CTVolume) => {
    try {
      setStep("preprocessing");
      setProgress(30);
      hapticImpact("light");

      const patches = extractPatches3D(vol);
      setProgress(50);

      setStep("inference");
      setProgress(60);

      if (!engine) {
        throw new Error("Edge AI engine not initialized");
      }

      const inferenceResult = await engine.runCTAnalysis({
        volumeMeta: vol.meta,
        patchData: patches,
        childAgeMonths: vol.meta.patientAgeMonths,
      });

      if (!inferenceResult) {
        throw new Error("CT analysis not available in current runtime");
      }

      setResult(inferenceResult);
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

      const file = await pickCTFile();
      if (!file) {
        setStep("select");
        return;
      }

      setProgress(20);
      const vol = await loadCTVolumeFromFile(file, modality);
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

      const vol = generateDemoVolume(modality);
      setVolume(vol);
      setProgress(25);
      await runPipeline(vol);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Demo failed");
      setStep("error");
    }
  };

  const handleViewResults = () => {
    if (volume && result) {
      navigate("/ct-viewer", {
        state: { volume, result },
      });
    }
  };

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-[#E0F7FA] to-[#F5F5F5] pb-8">
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Import CT Study</h1>
            <p className="text-sm text-[#666666]">DICOM / NIfTI • Local processing only</p>
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
                <label className="text-sm font-semibold text-[#1A1A1A] block mb-2">CT Modality</label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value as CTModality)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-[#1A1A1A]"
                >
                  {MODALITIES.map((m) => (
                    <option key={m} value={m}>{CT_MODALITY_LABELS[m]}</option>
                  ))}
                </select>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleFileImport}
                className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E0F7FA] flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#00838F]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A1A1A]">Choose CT File</p>
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
                className="w-full bg-gradient-to-r from-[#00838F] to-[#006064] rounded-2xl p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Run Demo Analysis</p>
                    <p className="text-xs text-white/70 mt-1">
                      Generate a simulated {CT_MODALITY_LABELS[modality]} volume (64x64x64)
                    </p>
                  </div>
                </div>
              </motion.button>

              <div className="bg-[#FFF8E1] border border-[#FFF59D] rounded-2xl p-3">
                <p className="text-xs text-[#666666]">
                  <strong>Demo mode:</strong> The simulated volume generates synthetic anatomical
                  structures for demonstration. In clinical use, real DICOM data would be loaded
                  and analyzed by the MedGemma CT model.
                </p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {(step === "loading" || step === "preprocessing" || step === "inference") && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-6 h-6 text-[#00838F] animate-spin" />
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">
                      {step === "loading" && "Loading CT data..."}
                      {step === "preprocessing" && "Preprocessing volume..."}
                      {step === "inference" && "Running MedGemma inference..."}
                    </p>
                    <p className="text-xs text-[#666666]">
                      {step === "loading" && "Reading DICOM/NIfTI data"}
                      {step === "preprocessing" && "Normalizing HU, extracting 64³ patches"}
                      {step === "inference" && "Patch-wise 3D analysis (~2.1s target)"}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-[#00838F] to-[#26C6DA] h-3 rounded-full"
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
                    <p className="font-bold text-[#1A1A1A]">Analysis Complete</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[#666666]">Volume</p>
                      <p className="font-medium text-[#1A1A1A]">
                        {volume.meta.rows}x{volume.meta.cols}x{volume.meta.sliceCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#666666]">Modality</p>
                      <p className="font-medium text-[#1A1A1A]">
                        {CT_MODALITY_LABELS[volume.meta.modality]}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#666666]">Latency</p>
                      <p className="font-medium text-[#1A1A1A]">
                        {(result.latencyMs / 1000).toFixed(1)}s
                      </p>
                    </div>
                    <div>
                      <p className="text-[#666666]">Risk Tier</p>
                      <p className="font-bold" style={{
                        color: result.riskTier === "ON_TRACK" ? "#34A853"
                          : result.riskTier === "MONITOR" ? "#F9AB00"
                          : result.riskTier === "REFER" ? "#EA4335"
                          : "#B71C1C"
                      }}>
                        {result.riskTier}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleViewResults}
                  className="w-full bg-gradient-to-r from-[#00838F] to-[#006064] rounded-2xl p-4 text-center"
                >
                  <span className="text-white font-bold text-lg">View 3D Results</span>
                </motion.button>

                <button
                  onClick={() => {
                    setStep("select");
                    setVolume(null);
                    setResult(null);
                    setProgress(0);
                  }}
                  className="w-full text-center text-sm text-[#00838F] font-medium py-2"
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
                  className="text-sm text-[#00838F] font-medium"
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
