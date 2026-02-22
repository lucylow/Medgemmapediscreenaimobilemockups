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
]);
