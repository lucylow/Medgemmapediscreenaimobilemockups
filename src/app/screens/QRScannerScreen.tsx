import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, QrCode, Camera, AlertCircle, Scan, Zap, Users, FlashlightOff } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { TabBar } from "../components/TabBar";
import { useApp } from "../context/AppContext";
import { decodeQR, getChildFromQR } from "../platform/qrUtils";
import { hapticImpact, hapticNotification, hapticSelection } from "../platform/haptics";
import { motion, AnimatePresence } from "motion/react";

type ScanState = "idle" | "scanning" | "found" | "error";

export function QRScannerScreen() {
  const navigate = useNavigate();
  const { children, addChild, getChild } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [cameraSupported, setCameraSupported] = useState(true);
  const [foundChild, setFoundChild] = useState<{ name: string; id: string; isNew: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanCount, setScanCount] = useState(0);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanState("scanning");
      startScanning();
    } catch {
      setCameraSupported(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startScanning = useCallback(() => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    const hasBarcodeDetector = "BarcodeDetector" in window;

    if (hasBarcodeDetector) {
      const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
      scanIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            handleDetected(barcodes[0].rawValue);
          }
        } catch {}
      }, 300);
    } else {
      setScanState("error");
      setErrorMsg("QR scanning not supported on this browser. Use Demo mode instead.");
      stopCamera();
      setTimeout(() => setScanState("idle"), 3000);
    }
  }, []);

  const handleDetected = useCallback((raw: string) => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    hapticNotification("success");

    const qr = decodeQR(raw);
    if (!qr || qr.type !== "patient") {
      setScanState("error");
      setErrorMsg("Not a valid PediScreen QR code");
      hapticNotification("error");
      setTimeout(() => {
        setScanState("scanning");
        startScanning();
      }, 2500);
      return;
    }

    const childData = getChildFromQR(qr);
    if (!childData || !childData.id) {
      setScanState("error");
      setErrorMsg("Invalid patient data in QR code");
      return;
    }

    const existing = getChild(childData.id);
    if (existing) {
      setFoundChild({ name: existing.displayName, id: existing.id, isNew: false });
    } else {
      const newChild = addChild({
        id: childData.id,
        displayName: childData.displayName || "Unknown",
        birthDate: childData.birthDate || new Date().toISOString(),
        sex: childData.sex,
        primaryLanguage: childData.primaryLanguage,
      });
      setFoundChild({ name: newChild.displayName, id: newChild.id, isNew: true });
    }
    setScanState("found");
  }, [getChild, addChild, startScanning]);

  const handleManualDemo = () => {
    hapticImpact("medium");
    if (children.length > 0) {
      const child = children[0];
      setFoundChild({ name: child.displayName, id: child.id, isNew: false });
      setScanState("found");
    } else {
      setErrorMsg("No children in the system. Add a child first.");
      setScanState("error");
      setTimeout(() => setScanState("idle"), 2500);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <MobileContainer>
      <div className="h-full flex flex-col bg-black">
        <div className="absolute top-0 left-0 right-0 px-4 py-3 z-20 flex items-center gap-3">
          <button onClick={() => { stopCamera(); navigate(-1); }} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">QR Scanner</h1>
            <p className="text-xs text-white/60">Scan patient QR code</p>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          {scanState === "idle" && !cameraSupported && (
            <div className="h-full flex flex-col items-center justify-center gap-4 px-8 text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <FlashlightOff className="w-10 h-10 text-white/50" />
              </div>
              <h2 className="text-lg font-bold text-white">Camera Not Available</h2>
              <p className="text-sm text-white/60">Camera access is needed to scan QR codes. You can still use the demo mode below.</p>
              <button
                onClick={handleManualDemo}
                className="px-6 py-3 bg-[#1A73E8] text-white rounded-xl font-semibold active:scale-[0.98] transition-transform"
              >
                Demo: Quick Lookup
              </button>
            </div>
          )}

          {scanState === "idle" && cameraSupported && (
            <div className="h-full flex flex-col items-center justify-center gap-6 px-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-3xl flex items-center justify-center shadow-lg"
              >
                <QrCode className="w-12 h-12 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Scan Patient QR</h2>
                <p className="text-sm text-white/60">Point your camera at a PediScreen patient QR code for instant record access</p>
              </div>
              <div className="space-y-3 w-full max-w-[280px]">
                <button
                  onClick={startCamera}
                  className="w-full py-4 bg-[#1A73E8] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg min-h-[56px]"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera
                </button>
                <button
                  onClick={handleManualDemo}
                  className="w-full py-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform min-h-[48px]"
                >
                  <Zap className="w-4 h-4" />
                  Demo: Quick Lookup
                </button>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#34A853] rounded-full" />
                  <span className="text-[10px] text-white/50">0.8s scan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#FBBC05] rounded-full" />
                  <span className="text-[10px] text-white/50">Offline-first</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#1A73E8] rounded-full" />
                  <span className="text-[10px] text-white/50">Encrypted</span>
                </div>
              </div>
            </div>
          )}

          {(scanState === "scanning" || scanState === "error") && (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} className="hidden" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <motion.div
                    className="absolute inset-0 border-4 border-white/30 rounded-3xl"
                    animate={scanState === "scanning" ? { borderColor: ["rgba(255,255,255,0.3)", "rgba(26,115,232,0.8)", "rgba(255,255,255,0.3)"] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#1A73E8] rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#1A73E8] rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#1A73E8] rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#1A73E8] rounded-br-xl" />
                  </motion.div>

                  {scanState === "scanning" && (
                    <motion.div
                      className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#1A73E8] to-transparent"
                      animate={{ top: ["10%", "90%", "10%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </div>
              </div>

              <div className="absolute bottom-32 inset-x-0 text-center px-6">
                {scanState === "scanning" && (
                  <p className="text-white text-lg font-semibold">Hold steady over QR code</p>
                )}
                {scanState === "error" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#EA4335] text-white px-5 py-3 rounded-2xl inline-flex items-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">{errorMsg}</span>
                  </motion.div>
                )}
              </div>

              <div className="absolute bottom-8 inset-x-0 flex justify-center">
                <button
                  onClick={() => { stopCamera(); setScanState("idle"); }}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          <AnimatePresence>
            {scanState === "found" && foundChild && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-full flex flex-col items-center justify-center gap-6 px-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-24 h-24 bg-[#34A853] rounded-full flex items-center justify-center shadow-lg"
                >
                  <Users className="w-12 h-12 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {foundChild.isNew ? "New Patient Added" : "Patient Found"}
                  </h2>
                  <p className="text-2xl font-extrabold text-white">{foundChild.name}</p>
                  <p className="text-sm text-white/60 mt-1">
                    {foundChild.isNew ? "Record created from QR data" : "Existing record loaded"}
                  </p>
                </div>
                <div className="space-y-3 w-full max-w-[280px]">
                  <button
                    onClick={() => { stopCamera(); navigate(`/child/${foundChild.id}/screening-intro`); }}
                    className="w-full py-4 bg-[#1A73E8] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform min-h-[56px]"
                  >
                    <Scan className="w-5 h-5" />
                    Start Screening
                  </button>
                  <button
                    onClick={() => { stopCamera(); navigate(`/qr-card/${foundChild.id}`); }}
                    className="w-full py-3 bg-white/10 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform min-h-[48px]"
                  >
                    <QrCode className="w-4 h-4" />
                    View QR Card
                  </button>
                  <button
                    onClick={() => { setScanState("idle"); setFoundChild(null); }}
                    className="w-full py-3 text-white/60 font-medium text-sm"
                  >
                    Scan Another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-black">
          <TabBar />
        </div>
      </div>
    </MobileContainer>
  );
}
