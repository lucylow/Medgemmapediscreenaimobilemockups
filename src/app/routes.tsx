import { createBrowserRouter } from "react-router";
import { Welcome } from "./screens/Welcome";
import { Permissions } from "./screens/Permissions";
import { Authentication } from "./screens/Authentication";
import { ModelLoading } from "./screens/ModelLoading";
import { ModelReady } from "./screens/ModelReady";
import { Dashboard } from "./screens/Dashboard";
import { NewScreening } from "./screens/NewScreening";
import { QRScanner } from "./screens/QRScanner";
import { CameraScreening } from "./screens/CameraScreening";
import { ROPCamera } from "./screens/ROPCamera";
import { BehavioralAnalysis } from "./screens/BehavioralAnalysis";
import { LiveInference } from "./screens/LiveInference";
import { ASQ3Dashboard } from "./screens/ASQ3Dashboard";
import { WHOGrowth } from "./screens/WHOGrowth";
import { AttentionMaps } from "./screens/AttentionMaps";
import { FeatureImportance } from "./screens/FeatureImportance";
import { ValidationDashboard } from "./screens/ValidationDashboard";
import { TrainingFeedback } from "./screens/TrainingFeedback";
import { AIPredictions } from "./screens/AIPredictions";
import { RiskResults } from "./screens/RiskResults";
import { ImpactDashboard } from "./screens/ImpactDashboard";
import { LongitudinalGrowth } from "./screens/LongitudinalGrowth";
import { PatientDetail } from "./screens/PatientDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Welcome,
  },
  {
    path: "/permissions",
    Component: Permissions,
  },
  {
    path: "/auth",
    Component: Authentication,
  },
  {
    path: "/model-loading",
    Component: ModelLoading,
  },
  {
    path: "/model-ready",
    Component: ModelReady,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/patient/:id",
    Component: PatientDetail,
  },
  {
    path: "/new-screening",
    Component: NewScreening,
  },
  {
    path: "/qr-scanner",
    Component: QRScanner,
  },
  {
    path: "/camera-screening",
    Component: CameraScreening,
  },
  {
    path: "/rop-camera",
    Component: ROPCamera,
  },
  {
    path: "/behavioral-analysis",
    Component: BehavioralAnalysis,
  },
  {
    path: "/live-inference",
    Component: LiveInference,
  },
  {
    path: "/asq3-dashboard",
    Component: ASQ3Dashboard,
  },
  {
    path: "/who-growth",
    Component: WHOGrowth,
  },
  {
    path: "/attention-maps",
    Component: AttentionMaps,
  },
  {
    path: "/feature-importance",
    Component: FeatureImportance,
  },
  {
    path: "/validation-dashboard",
    Component: ValidationDashboard,
  },
  {
    path: "/training-feedback",
    Component: TrainingFeedback,
  },
  {
    path: "/ai-predictions",
    Component: AIPredictions,
  },
  {
    path: "/results/:id",
    Component: RiskResults,
  },
  {
    path: "/impact",
    Component: ImpactDashboard,
  },
  {
    path: "/longitudinal/:id",
    Component: LongitudinalGrowth,
  },
]);