import { createBrowserRouter } from "react-router";
import { Welcome } from "./screens/Welcome";
import { Dashboard } from "./screens/Dashboard";
import { ChildList } from "./screens/ChildList";
import { AddChild } from "./screens/AddChild";
import { ScreeningIntro } from "./screens/ScreeningIntro";
import { ScreeningQuestions } from "./screens/ScreeningQuestions";
import { ScreeningSummary } from "./screens/ScreeningSummary";
import { ScreeningResults } from "./screens/ScreeningResults";
import { Timeline } from "./screens/Timeline";
import { ClinicianReview } from "./screens/ClinicianReview";
import { DemoCases } from "./screens/DemoCases";
import { SettingsScreen } from "./screens/SettingsScreen";
import { DomainSelect } from "./screens/DomainSelect";
import { SymptomCheckerWelcome } from "./screens/SymptomCheckerWelcome";
import { SymptomSelection } from "./screens/SymptomSelection";
import { SymptomDetails } from "./screens/SymptomDetails";
import { SymptomResults } from "./screens/SymptomResults";
import { RashAnalysis } from "./screens/RashAnalysis";
import { GrowthTracker } from "./screens/GrowthTracker";
import { QRPatientCard } from "./screens/QRPatientCard";
import { QRScannerScreen } from "./screens/QRScannerScreen";
import { EdgeDiagnosticsScreen } from "./screens/EdgeDiagnosticsScreen";
import { MedGemmaModelsScreen } from "./screens/MedGemmaModelsScreen";
import { XrayAnalysisScreen } from "./screens/XrayAnalysisScreen";
import { CTScanHomeScreen } from "./screens/CTScanHomeScreen";
import { CTImportScreen } from "./screens/CTImportScreen";
import { CT3DViewerScreen } from "./screens/CT3DViewerScreen";
import { CTSerialCompareScreen } from "./screens/CTSerialCompareScreen";
import { MRIScanHomeScreen } from "./screens/MRIScanHomeScreen";
import { MRIImportScreen } from "./screens/MRIImportScreen";
import { MRIMultiplanarScreen } from "./screens/MRIMultiplanarScreen";
import { MRISerialTrackingScreen } from "./screens/MRISerialTrackingScreen";
import { CameraScreening } from "./screens/CameraScreening";
import { ROPCamera } from "./screens/ROPCamera";
import { ROPResultsScreen } from "./screens/ROPResultsScreen";
import { ScreeningInputScreen } from "./screens/ScreeningInputScreen";
import { EnhancedResultsScreen } from "./screens/EnhancedResultsScreen";
import { WearableDashboard } from "./screens/WearableDashboard";
import { WearableHRVScreen } from "./screens/WearableHRVScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Welcome,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/children",
    Component: ChildList,
  },
  {
    path: "/add-child",
    Component: AddChild,
  },
  {
    path: "/child/:id/screening-intro",
    Component: ScreeningIntro,
  },
  {
    path: "/screening/:sessionId/domain-select",
    Component: DomainSelect,
  },
  {
    path: "/screening/:sessionId/questions",
    Component: ScreeningQuestions,
  },
  {
    path: "/screening/:sessionId/summary",
    Component: ScreeningSummary,
  },
  {
    path: "/screening-results/:sessionId",
    Component: ScreeningResults,
  },
  {
    path: "/timeline/:childId",
    Component: Timeline,
  },
  {
    path: "/clinician-review",
    Component: ClinicianReview,
  },
  {
    path: "/demo-cases",
    Component: DemoCases,
  },
  {
    path: "/settings",
    Component: SettingsScreen,
  },
  {
    path: "/symptom-checker",
    Component: SymptomCheckerWelcome,
  },
  {
    path: "/symptom-selection",
    Component: SymptomSelection,
  },
  {
    path: "/symptom-details",
    Component: SymptomDetails,
  },
  {
    path: "/symptom-results",
    Component: SymptomResults,
  },
  {
    path: "/rash-analysis",
    Component: RashAnalysis,
  },
  {
    path: "/growth-tracker",
    Component: GrowthTracker,
  },
  {
    path: "/qr-card/:childId",
    Component: QRPatientCard,
  },
  {
    path: "/qr-scanner",
    Component: QRScannerScreen,
  },
  {
    path: "/edge-diagnostics",
    Component: EdgeDiagnosticsScreen,
  },
  {
    path: "/medgemma-models",
    Component: MedGemmaModelsScreen,
  },
  {
    path: "/xray-analysis",
    Component: XrayAnalysisScreen,
  },
  {
    path: "/ct-scan",
    Component: CTScanHomeScreen,
  },
  {
    path: "/ct-import",
    Component: CTImportScreen,
  },
  {
    path: "/ct-viewer",
    Component: CT3DViewerScreen,
  },
  {
    path: "/ct-serial",
    Component: CTSerialCompareScreen,
  },
  {
    path: "/mri-scan",
    Component: MRIScanHomeScreen,
  },
  {
    path: "/mri-import",
    Component: MRIImportScreen,
  },
  {
    path: "/mri-viewer",
    Component: MRIMultiplanarScreen,
  },
  {
    path: "/mri-serial",
    Component: MRISerialTrackingScreen,
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
    path: "/rop-results",
    Component: ROPResultsScreen,
  },
  {
    path: "/screening-input",
    Component: ScreeningInputScreen,
  },
  {
    path: "/screening-results-enhanced",
    Component: EnhancedResultsScreen,
  },
  {
    path: "/wearable",
    Component: WearableDashboard,
  },
  {
    path: "/wearable-hrv",
    Component: WearableHRVScreen,
  },
]);
