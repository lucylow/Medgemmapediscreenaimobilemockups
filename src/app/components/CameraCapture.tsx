import { useRef, useEffect, useState } from "react";
import { useCamera } from "../platform/useCamera";
import { Camera, X, RotateCcw, Check } from "lucide-react";
import { hapticImpact, hapticNotification } from "../platform/haptics";
import { motion, AnimatePresence } from "motion/react";

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { startCamera, capturePhoto, stopCamera, isCapturing, error, isSupported } = useCamera();
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current && isSupported) {
      startCamera(videoRef.current);
    }
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    hapticImpact("heavy");
    const photo = capturePhoto();
    if (photo) {
      setPreview(photo);
      hapticNotification("success");
    }
  };

  const handleAccept = () => {
    if (preview) {
      hapticImpact("medium");
      onCapture(preview);
      stopCamera();
    }
  };

  const handleRetake = () => {
    hapticImpact("light");
    setPreview(null);
  };

  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-6 max-w-sm text-center space-y-4">
          <Camera className="w-12 h-12 text-[#999999] mx-auto" />
          <p className="text-[#666666]">Camera is not available on this device.</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#1A73E8] text-white rounded-xl font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 absolute top-0 left-0 right-0 z-10">
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="w-10 h-10 flex items-center justify-center text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-white text-sm font-semibold">Take Photo</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {preview ? (
          <img src={preview} alt="Captured" className="max-w-full max-h-full object-contain" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {error && (
        <div className="absolute bottom-28 left-4 right-4 bg-[#EA4335]/90 text-white text-sm rounded-xl p-3 text-center">
          {error}
        </div>
      )}

      <div className="bg-black/50 px-6 py-6 flex items-center justify-center gap-8">
        {preview ? (
          <>
            <button
              onClick={handleRetake}
              className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              <RotateCcw className="w-7 h-7" />
            </button>
            <button
              onClick={handleAccept}
              className="w-[72px] h-[72px] rounded-full bg-[#34A853] flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              <Check className="w-8 h-8" />
            </button>
          </>
        ) : (
          <button
            onClick={handleCapture}
            disabled={!isCapturing}
            className="w-[72px] h-[72px] rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
          >
            <div className="w-[56px] h-[56px] rounded-full bg-white" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
