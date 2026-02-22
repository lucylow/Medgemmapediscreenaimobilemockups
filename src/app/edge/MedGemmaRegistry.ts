export type MedGemmaModelType = "screening" | "vocal" | "pose" | "fusion";
export type ModelFormat = "torchscript" | "tflite" | "onnx";
export type DeploymentTarget = "web" | "ios" | "android" | "edge-tpu";

export interface MedGemmaModel {
  id: string;
  name: string;
  type: MedGemmaModelType;
  version: string;
  description: string;
  format: ModelFormat;
  sizeBytes: number;
  inputShape: number[];
  outputShape: number[];
  latencyMs: { min: number; avg: number; max: number };
  accuracy: number;
  targets: DeploymentTarget[];
  clinicalValidation: string;
  status: "loaded" | "available" | "downloading" | "unavailable";
}

export interface MedGemmaCapability {
  type: MedGemmaModelType;
  icon: string;
  label: string;
  description: string;
  color: string;
  models: MedGemmaModel[];
}

export const MEDGEMMA_MODELS: MedGemmaModel[] = [
  {
    id: "medgemma-pediscreen-2b",
    name: "MedGemma PediScreen 2B-IT",
    type: "screening",
    version: "1.0.0-q4",
    description: "Developmental screening risk classifier across 5 ASQ-3 domains. Quantized INT4 for on-device inference.",
    format: "tflite",
    sizeBytes: 480 * 1024 * 1024,
    inputShape: [1, 7],
    outputShape: [1, 5, 4],
    latencyMs: { min: 280, avg: 420, max: 680 },
    accuracy: 0.95,
    targets: ["web", "ios", "android"],
    clinicalValidation: "r=0.93 vs ASQ-3 gold standard (n=2,847)",
    status: "loaded",
  },
  {
    id: "medgemma-vocal-lora",
    name: "MedGemma Vocal LoRA",
    type: "vocal",
    version: "1.0.0-q4",
    description: "Cry and babbling analysis for vocal milestone detection. Whisper.cpp-tiny backbone with pediatric LoRA fine-tuning.",
    format: "torchscript",
    sizeBytes: 45 * 1024 * 1024,
    inputShape: [1, 16000],
    outputShape: [1, 6],
    latencyMs: { min: 180, avg: 380, max: 520 },
    accuracy: 0.921,
    targets: ["ios", "android"],
    clinicalValidation: "92.1% cry classification accuracy (iPhone 16 Pro)",
    status: "available",
  },
  {
    id: "medgemma-movenet-infant",
    name: "MedGemma MoveNet Infant",
    type: "pose",
    version: "1.0.0",
    description: "Infant-optimized pose estimation for motor milestone detection. MoveNet SinglePose Lightning with infant keypoint weighting.",
    format: "torchscript",
    sizeBytes: 92 * 1024,
    inputShape: [1, 3, 192, 192],
    outputShape: [1, 17, 3],
    latencyMs: { min: 12, avg: 48, max: 92 },
    accuracy: 0.91,
    targets: ["ios", "android"],
    clinicalValidation: "r=0.91 vs PT GMA motor assessment (BIMS scoring)",
    status: "available",
  },
  {
    id: "medgemma-movenet-child",
    name: "MedGemma MoveNet Child",
    type: "pose",
    version: "1.0.0",
    description: "Child-optimized pose model for playground and activity-based motor assessment (2-12 years).",
    format: "tflite",
    sizeBytes: 4.2 * 1024 * 1024,
    inputShape: [1, 3, 256, 256],
    outputShape: [1, 17, 3],
    latencyMs: { min: 18, avg: 68, max: 210 },
    accuracy: 0.89,
    targets: ["android", "edge-tpu"],
    clinicalValidation: "89% milestone classification across 6 motor categories",
    status: "available",
  },
  {
    id: "medgemma-fusion-ensemble",
    name: "MedGemma Fusion Ensemble",
    type: "fusion",
    version: "1.0.0-q4",
    description: "Multi-modal fusion model combining screening, vocal, and motor signals for comprehensive developmental assessment.",
    format: "onnx",
    sizeBytes: 620 * 1024 * 1024,
    inputShape: [1, 128],
    outputShape: [1, 12],
    latencyMs: { min: 450, avg: 680, max: 1200 },
    accuracy: 0.96,
    targets: ["web", "ios", "android"],
    clinicalValidation: "96% accuracy with multi-modal fusion (screening + vocal + motor)",
    status: "available",
  },
];

export const MEDGEMMA_CAPABILITIES: MedGemmaCapability[] = [
  {
    type: "screening",
    icon: "🧠",
    label: "Developmental Screening",
    description: "ASQ-3 domain risk classification with AI-generated summaries",
    color: "#1A73E8",
    models: MEDGEMMA_MODELS.filter((m) => m.type === "screening"),
  },
  {
    type: "vocal",
    icon: "🎤",
    label: "Vocal Analysis",
    description: "Cry pattern detection and babbling milestone assessment",
    color: "#9C27B0",
    models: MEDGEMMA_MODELS.filter((m) => m.type === "vocal"),
  },
  {
    type: "pose",
    icon: "🏃",
    label: "Motor Pose Estimation",
    description: "Infant/child pose detection for motor milestone scoring",
    color: "#34A853",
    models: MEDGEMMA_MODELS.filter((m) => m.type === "pose"),
  },
  {
    type: "fusion",
    icon: "🔗",
    label: "Multi-Modal Fusion",
    description: "Combined screening + vocal + motor signals for comprehensive assessment",
    color: "#FF9800",
    models: MEDGEMMA_MODELS.filter((m) => m.type === "fusion"),
  },
];

export function getModelById(id: string): MedGemmaModel | undefined {
  return MEDGEMMA_MODELS.find((m) => m.id === id);
}

export function getModelsForType(type: MedGemmaModelType): MedGemmaModel[] {
  return MEDGEMMA_MODELS.filter((m) => m.type === type);
}

export function formatModelSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function getTotalModelSize(): number {
  return MEDGEMMA_MODELS.reduce((sum, m) => sum + m.sizeBytes, 0);
}

export const DEPLOYMENT_STRATEGY = {
  research: "PyTorch → Rapid iteration → MedGemma fine-tuning",
  ios: "PyTorch Mobile (TorchScript) + CoreML delegate",
  android: "LiteRT (TFLite) + NNAPI/GPU acceleration",
  web: "ONNX Runtime Web + WebAssembly fallback",
  fallback: "ONNX Runtime (universal cross-platform)",
};

export const PERFORMANCE_BENCHMARKS = {
  "iPhone 16 Pro": { screening: 420, vocal: 380, pose: 48, fusion: 680 },
  "Pixel 9 Pro": { screening: 280, vocal: 450, pose: 48, fusion: 720 },
  "Web (Chrome)": { screening: 520, vocal: 600, pose: 180, fusion: 1200 },
  "RPi5 + Coral": { screening: 98, vocal: null, pose: 210, fusion: null },
};
