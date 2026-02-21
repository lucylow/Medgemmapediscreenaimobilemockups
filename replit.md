# MedGemma PediScreen AI

## Overview
A React-based pediatric developmental screening application for the MedGemma Impact Challenge (Kaggle). Supports parents, community health workers (CHWs), and clinicians with guided developmental screening for children 0-5 years. Features native-like mobile platform APIs including haptic feedback, camera integration, PIN lock, offline support, and PWA installability.

## Key Features
- **Role-based entry**: Parent/Caregiver, CHW, or Clinician demo mode
- **Child management**: Add/edit/delete child profiles with localStorage persistence + camera photo capture
- **Screening flow**: ASQ-3 inspired questions across 5 developmental domains (Communication, Gross Motor, Fine Motor, Personal-Social, Problem Solving) with age-appropriate question banks (0-11mo, 12-17mo, 18-23mo, 24-35mo, 36-60mo)
- **Domain selection**: Choose which developmental areas to screen before starting
- **AI-assisted results**: Screening engine evaluates answers and generates risk levels (On Track, Monitor, Discuss, Refer) with parent-friendly summaries and clinician drafts
- **Expandable clinician section**: Results include collapsible "For Your Clinician" with AI-generated draft and safety validation
- **Consent gating**: Screening submission requires explicit consent checkbox
- **Timeline/history**: View past screenings per child with risk trend chart
- **Clinician review demo**: Shows AI draft vs clinician-approved text (HITL pipeline)
- **Demo cases**: 4 preconfigured risk scenarios for instant demonstration
- **Settings**: Mock API toggle, clear data, privacy info, PIN lock, notifications, app version
- **Bottom tab navigation**: Home, Children, Demo, Settings tabs with haptic feedback
- **Safety**: Disclaimer footers, non-diagnostic language throughout, safety flags on results

## Platform APIs (Mobile Features)
- **Haptic feedback**: Web Vibration API for risk-level-specific feedback, button presses, swipe gestures, and screening submissions
- **Camera integration**: getUserMedia API for child profile photos with live preview and capture
- **PIN lock**: 4-digit PIN screen to protect health data (biometric equivalent for web)
- **Offline indicator**: Real-time online/offline detection with visual banner
- **Swipe gestures**: Touch swipe navigation between screening questions
- **PWA support**: Web app manifest + service worker for home screen installation
- **Browser notifications**: Notification API for screening result alerts and follow-up reminders
- **Enhanced touch targets**: 60px+ minimum for CHW field use with gloved hands
- **Safe area support**: iOS safe area insets for notch/home indicator

## Project Architecture
- **Framework**: React 18 + Vite 6
- **Styling**: Tailwind CSS v4 with @tailwindcss/vite plugin
- **UI Libraries**: Radix UI, Lucide icons, Recharts, Framer Motion
- **Routing**: react-router v7
- **State**: React Context (AppContext) + localStorage
- **Package Manager**: pnpm
- **Build Output**: `dist/`
- **PWA**: manifest.json + sw.js service worker

## Project Structure
```
src/
  main.tsx              - Entry point
  app/
    App.tsx             - Root component with AppProvider + PIN lock + offline banner
    routes.tsx          - Route definitions
    context/
      AppContext.tsx     - Global state management
    platform/           - Native-like platform APIs
      haptics.ts        - Web Vibration API wrapper (risk-level haptics, impact, selection)
      useCamera.ts      - getUserMedia hook for photo capture
      useOnlineStatus.ts - Online/offline status hook
      useSwipeGesture.ts - Touch swipe gesture hook
      notifications.ts  - Browser Notification API (alerts, reminders)
    components/
      MobileContainer   - Phone-frame wrapper
      PrimaryButton     - Reusable button with haptic feedback
      RiskBanner        - Risk level banner
      DisclaimerFooter  - Safety disclaimer
      TabBar            - Bottom tab navigation with haptics + 60px targets
      OfflineBanner     - Connection status indicator
      CameraCapture     - Full-screen camera capture overlay
      ui/               - shadcn/ui components
    screens/
      Welcome           - Landing with role selection
      ChildList          - Child management list with photo support
      AddChild           - Add child form with camera integration
      ScreeningIntro     - Pre-screening info
      DomainSelect       - Domain selection before questions
      ScreeningQuestions - Question flow with swipe gestures + haptics
      ScreeningSummary   - Review & submit with consent
      ScreeningResults   - Results with haptic risk feedback + notifications
      Timeline           - Screening history with trend chart
      Dashboard          - Overview dashboard
      ClinicianReview    - Clinician demo view
      DemoCases          - Preset risk scenario demos
      SettingsScreen     - Settings with PIN lock, notifications, API mode
      PinLock            - 4-digit PIN lock screen
    data/
      types.ts          - TypeScript interfaces
      storage.ts        - localStorage CRUD
      questions.ts      - ASQ-3 inspired question banks
      screeningEngine.ts - Scoring & result generation
      demoData.ts       - Demo data loader
  styles/               - CSS files
public/
  manifest.json         - PWA manifest
  sw.js                 - Service worker (offline cache)
  pwa-icon-192.png      - App icon 192x192
  pwa-icon-512.png      - App icon 512x512
```

## Navigation Flow
```
[PIN Lock (if enabled)] →
Welcome (role select) →
  Parent/CHW → Children List → Add Child (+ camera) → Screening Intro →
    Domain Select → Questions (swipe + haptics) → Summary (with consent) → Submit → Results (haptic + notification) → Timeline
  Clinician → Clinician Review (demo)

Tab Navigation (persistent on main screens):
  Home (Dashboard) | Children | Demo Cases | Settings
```

## Development
- Dev server: `npx vite --host 0.0.0.0 --port 5000`
- Build: `npx vite build`
- Output goes to `dist/`

## Recent Changes
- 2026-02-21: Platform APIs - Mobile Feature Enhancement
  - Added haptic feedback (Web Vibration API) across all interactions
  - Added camera integration for child profile photos (getUserMedia)
  - Added 4-digit PIN lock screen for health data protection
  - Added offline status indicator banner
  - Added swipe gesture navigation on screening questions
  - Added PWA manifest + service worker for installable home screen app
  - Added browser notification alerts for screening results
  - Enhanced touch targets to 60px+ for CHW field use
  - Added safe area insets for iOS devices
  - Updated Settings with Security (PIN) and Notifications sections
  - Added platform capability badges to About section
  - Photo field added to Child type + displayed in child list
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
