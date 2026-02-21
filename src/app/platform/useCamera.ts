import { useState, useRef, useCallback } from "react";

export function useCamera() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async (video: HTMLVideoElement) => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      video.srcObject = stream;
      await video.play();
      videoRef.current = video;
      streamRef.current = stream;
      setIsCapturing(true);
    } catch (err) {
      setError("Camera not available. You can still add a child without a photo.");
      setIsCapturing(false);
    }
  }, []);

  const capturePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const isSupported =
    typeof navigator !== "undefined" &&
    "mediaDevices" in navigator &&
    "getUserMedia" in navigator.mediaDevices;

  return { startCamera, capturePhoto, stopCamera, isCapturing, error, isSupported };
}
