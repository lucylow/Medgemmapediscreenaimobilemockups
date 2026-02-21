# MedGemma PediScreen AI

## Overview
A React-based pediatric developmental screening application for the MedGemma Impact Challenge (Kaggle). Supports parents, community health workers (CHWs), and clinicians with guided developmental screening for children 0-5 years.

## Key Features
- **Role-based entry**: Parent/Caregiver, CHW, or Clinician demo mode
- **Child management**: Add/edit/delete child profiles with localStorage persistence
- **Screening flow**: ASQ-3 inspired questions across 5 developmental domains (Communication, Gross Motor, Fine Motor, Personal-Social, Problem Solving) with age-appropriate question banks (0-11mo, 12-17mo, 18-23mo, 24-35mo, 36-60mo)
- **AI-assisted results**: Screening engine evaluates answers and generates risk levels (On Track, Monitor, Discuss, Refer) with parent-friendly summaries and clinician drafts
- **Timeline/history**: View past screenings per child with trend tracking
- **Clinician review demo**: Shows AI draft vs clinician-approved text (HITL pipeline)
- **Demo data loader**: Pre-loads 4 sample children with varied risk profiles
- **Safety**: Disclaimer footers, non-diagnostic language throughout

## Project Architecture
- **Framework**: React 18 + Vite 6
- **Styling**: Tailwind CSS v4 with @tailwindcss/vite plugin
- **UI Libraries**: Radix UI, Lucide icons, Recharts, Framer Motion
- **Routing**: react-router v7
- **State**: React Context (AppContext) + localStorage
- **Package Manager**: pnpm
- **Build Output**: `dist/`

## Project Structure
```
src/
  main.tsx              - Entry point
  app/
    App.tsx             - Root component with AppProvider
    routes.tsx          - Route definitions
    context/
      AppContext.tsx     - Global state management
    components/
      MobileContainer   - Phone-frame wrapper
      PrimaryButton     - Reusable button
      RiskBanner        - Risk level banner
      DisclaimerFooter  - Safety disclaimer
      ui/               - shadcn/ui components
    screens/
      Welcome           - Landing with role selection
      ChildList          - Child management list
      AddChild           - Add child form
      ScreeningIntro     - Pre-screening info
      ScreeningQuestions - Question flow
      ScreeningSummary   - Review & submit
      ScreeningResults   - Results display
      Timeline           - Screening history
      Dashboard          - Overview dashboard
      ClinicianReview    - Clinician demo view
    data/
      types.ts          - TypeScript interfaces
      storage.ts        - localStorage CRUD
      questions.ts      - ASQ-3 inspired question banks
      screeningEngine.ts - Scoring & result generation
      demoData.ts       - Demo data loader
      mockData.ts       - Legacy mock data
  styles/               - CSS files
```

## Navigation Flow
```
Welcome (role select) →
  Parent/CHW → Children List → Add Child → Screening Intro →
    Questions (per domain) → Summary → Submit → Results → Timeline
  Clinician → Clinician Review (demo)
  Dashboard (accessible from Children List)
```

## Development
- Dev server: `npx vite --host 0.0.0.0 --port 5000`
- Build: `npx vite build`
- Output goes to `dist/`

## Recent Changes
- 2026-02-21: Full feature implementation
  - Built complete screening flow with real ASQ-3 inspired questions
  - Added screening engine with scoring and risk assessment
  - Added child management with localStorage persistence
  - Added role selection, clinician review demo, disclaimer footers
  - Added demo data loader with 4 sample children
  - Connected all screens to real data through AppContext
  - Replaced static mockup navigation with functional flow
