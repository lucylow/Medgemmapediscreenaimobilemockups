# MedGemma PediScreen AI

## Overview
A React-based pediatric developmental screening application for the MedGemma Impact Challenge (Kaggle). Supports parents, community health workers (CHWs), and clinicians with guided developmental screening for children 0-5 years.

## Key Features
- **Role-based entry**: Parent/Caregiver, CHW, or Clinician demo mode
- **Child management**: Add/edit/delete child profiles with localStorage persistence
- **Screening flow**: ASQ-3 inspired questions across 5 developmental domains (Communication, Gross Motor, Fine Motor, Personal-Social, Problem Solving) with age-appropriate question banks (0-11mo, 12-17mo, 18-23mo, 24-35mo, 36-60mo)
- **Domain selection**: Choose which developmental areas to screen before starting
- **AI-assisted results**: Screening engine evaluates answers and generates risk levels (On Track, Monitor, Discuss, Refer) with parent-friendly summaries and clinician drafts
- **Expandable clinician section**: Results include collapsible "For Your Clinician" with AI-generated draft and safety validation
- **Consent gating**: Screening submission requires explicit consent checkbox
- **Timeline/history**: View past screenings per child with risk trend chart
- **Clinician review demo**: Shows AI draft vs clinician-approved text (HITL pipeline)
- **Demo cases**: 4 preconfigured risk scenarios for instant demonstration
- **Settings**: Mock API toggle, clear data, privacy info, app version
- **Bottom tab navigation**: Home, Children, Demo, Settings tabs
- **Safety**: Disclaimer footers, non-diagnostic language throughout, safety flags on results

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
      TabBar            - Bottom tab navigation
      ui/               - shadcn/ui components
    screens/
      Welcome           - Landing with role selection
      ChildList          - Child management list
      AddChild           - Add child form
      ScreeningIntro     - Pre-screening info
      DomainSelect       - Domain selection before questions
      ScreeningQuestions - Question flow
      ScreeningSummary   - Review & submit with consent
      ScreeningResults   - Results with clinician section
      Timeline           - Screening history with trend chart
      Dashboard          - Overview dashboard
      ClinicianReview    - Clinician demo view
      DemoCases          - Preset risk scenario demos
      SettingsScreen     - App settings & privacy
    data/
      types.ts          - TypeScript interfaces
      storage.ts        - localStorage CRUD
      questions.ts      - ASQ-3 inspired question banks
      screeningEngine.ts - Scoring & result generation
      demoData.ts       - Demo data loader
  styles/               - CSS files
```

## Navigation Flow
```
Welcome (role select) →
  Parent/CHW → Children List → Add Child → Screening Intro →
    Domain Select → Questions (per domain) → Summary (with consent) → Submit → Results → Timeline
  Clinician → Clinician Review (demo)

Tab Navigation (persistent on main screens):
  Home (Dashboard) | Children | Demo Cases | Settings
```

## Development
- Dev server: `npx vite --host 0.0.0.0 --port 5000`
- Build: `npx vite build`
- Output goes to `dist/`

## Recent Changes
- 2026-02-21: Enhanced mobile app functionality
  - Added bottom tab navigation bar (Home, Children, Demo, Settings)
  - Created Settings screen with mock API toggle, clear data, privacy info
  - Created Demo Cases screen with 4 preset risk scenarios
  - Added Domain Selection screen between intro and questions
  - Added consent checkbox gating on screening submission
  - Enhanced Results with expandable "For Your Clinician" section + safety flags
  - Added risk trend chart to Timeline view
  - Added edit answers link on review screen
  - All features use real data through AppContext + localStorage
