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
]);
