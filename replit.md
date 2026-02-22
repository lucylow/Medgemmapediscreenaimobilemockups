# MedGemma PediScreen AI

## Overview
MedGemma PediScreen AI is a React-based pediatric developmental screening application designed for parents, community health workers (CHWs), and clinicians. It provides guided developmental screening for children aged 0-5 years, incorporating AI-assisted risk assessment and native-like mobile platform APIs. The project aims to improve early identification of developmental delays, streamline screening workflows, and provide actionable insights for interventions, supporting global health initiatives and reducing healthcare burdens.

## User Preferences
No explicit user preferences were provided in the original `replit.md` file. The agent should infer preferences based on the project's goals and structure, prioritizing clarity, modularity, and maintainability.

## System Architecture
The application is built with React 18 and Vite 6, utilizing Tailwind CSS v4 for styling, Radix UI for UI components, and react-router v7 for navigation. State management is handled through React Context, localStorage, and IndexedDB for offline persistence.

**Key Architectural Decisions:**
- **Offline-First Architecture**: Implemented with IndexedDB for sync queues, impact metrics, and a Service Worker for asset caching, ensuring functionality even without internet connectivity. A Smart Sync Engine with priority-based queuing and exponential backoff manages data synchronization.
- **Mobile-First Design**: Incorporates platform APIs like Web Vibration API for haptic feedback, `getUserMedia` for camera integration, a 4-digit PIN lock for data security, and PWA support for installability. UI/UX elements, such as 60px+ touch targets and safe area support, are optimized for mobile use.
- **AI Integration**: Features AI-assisted screening results with risk level generation (On Track, Monitor, Discuss, Refer), clinician draft generation, and safety validation. Specialized AI features include a Symptom Checker for rapid milestone assessment and an AI-powered Rash Analysis tool for dermatological screening.
- **Modular Structure**: The codebase is organized into logical directories (e.g., `app/`, `offline/`, `platform/`, `edge/`, `data/`, `screens/`) to enhance maintainability and scalability.
- **Data Management**: Child profiles, screening data, and growth measurements are persisted locally using localStorage and IndexedDB.
- **Security**: PIN lock functionality protects sensitive health data, and explicit consent is required for screening submissions.
- **Extensible Features**: Designed to easily integrate new features like Growth Tracking with WHO standards and QR code functionalities for patient identification and data sharing.

**UI/UX Decisions:**
- Intuitive bottom tab navigation for core functionalities (Home, Children, Check, Demo, Settings).
- Role-based entry for tailored user experiences (Parent/Caregiver, CHW, Clinician).
- Visual feedback mechanisms include risk banners, progress bars, and haptic feedback.
- Safety disclaimers and non-diagnostic language are consistently used.

**Feature Specifications:**
- **Child Management**: CRUD operations for child profiles with camera photo capture.
- **Developmental Screening**: ASQ-3 inspired questions across 5 domains and age groups (0-60 months).
- **AI-assisted Results**: Generates risk levels, summaries, and clinician drafts.
- **Symptom Checker**: Rapid milestone assessment with age selector, domain grid, and AI analysis.
- **Rash Analysis**: AI-powered dermatological skin screening with live camera, quality metrics, and diagnosis.
- **Growth Tracker**: WHO growth standard tracking with Z-score calculation and interactive charts.
- **QR Code Functionality**: Generation of patient ID cards and screening result QR codes, and a scanner for data lookup.
- **Settings**: Configuration options including mock API toggle, data clearing, privacy, PIN lock, and notifications.

## MedGemma Production AI Runtime
- **MedGemmaContext** (`src/app/contexts/MedGemmaContext.tsx`): Production AI runtime context managing 4-layer pipeline state (Whisper → MedSigLIP → MedGemma → Risk), model loading, inference tracking, and clinical prompt engineering
- **useMedGemma hook** (`src/app/hooks/useMedGemma.ts`): Easy integration hook exposing analyzeScreening(), analyzeROP(), assessImageQuality(), createClinicalPrompt()
- **Clinical Prompt Engineering**: ASQ-3 + CDC validated prompts with red flag detection, regression alerts, ICD-10 assignment protocol
- **6 Developmental Domains**: communication, gross_motor, fine_motor, problem_solving, personal_social, rop_screening - each with domain-specific ICD-10 codes, risk biases, clinical summaries, red flag checks, and recommendations
- **Reusable Components**: RiskBanner (4-tier clinical display with pulse animation), LiveQualityOverlay (camera quality metrics), AIPipelineAnimation (4-step inference visualization)
- **ROP Camera Screening**: getUserMedia live video, 4 quality metrics (pupil/focus/lighting/vascular), Zone/Stage/Plus ETROP classification, gestational age metadata
- **Enhanced Clinical Screening**: Multimodal parent interview with Whisper STT simulation, CHW notes, 6-domain ASQ-3 grid, evidence-graded recommendations

## Edge AI Architecture
- **EdgeAiEngine**: Orchestrates on-device inference and summary generation via pluggable LocalModelRuntime interface
- **MockRuntime**: Demo runtime with 300-600ms latency, concern keyword detection (30+ keywords), red flag pattern matching (10 clinical patterns), age-adjusted risk multiplier (1.3x <12mo, 1.15x <24mo), domain-specific home activity recommendations
- **TFLiteRuntime**: Production stub implementing LocalModelRuntime for MedGemma-2B-IT-Q4 (450MB), production path via ONNX Runtime Web + WebAssembly
- **Feature Encoding**: Converts ScreeningSession answers to normalized float vectors for model input
- **Caching Layer**: Stable input hashing (age + domains + concerns + media), 5-minute TTL, max 50 entries LRU eviction, hit/miss statistics
- **EdgeStatusContext**: React context with pluggable runtime selection (mock/tflite), cache stats, async runtime switching
- **Integration**: Edge AI toggle on ScreeningSummary, results persisted through submitSession() override
- **Diagnostics**: /edge-diagnostics route shows model info, cache stats (hits/misses/rate), runtime switcher, benchmark latency
- **Provenance**: Edge results tagged with "medgemma-pediscreen-edge" model ID
- **ROP ETROP Classification**: Zone I/II/III, Stage 0-3, Plus disease (tortuosity/dilation 0-10), urgency stratification (emergent/urgent/monitor/routine), AV shunt detection, MedSigLIP 512-dim embedding simulation (180-300ms)
- **Multi-Modal Models**: Vocal analysis (cry classification, babbling milestones), Pose estimation (BIMS scoring, motor milestones), X-ray bone age (Greulich-Pyle, skeletal landmarks)
- **MedGemma Registry**: 8 model variants (PediScreen 2B, Vocal LoRA, MoveNet Infant/Child, BoneAge GP, CT 2B-IT Q4, MRI NeuroNet, Fusion Ensemble)
- **X-ray Analysis**: Bone age assessment with Z-score, percentile, growth velocity, fracture risk, ICD-10 codes, longitudinal timeline
- **CT Scan Analysis**: DICOM/NIfTI→3D volume pipeline with 64³ patch extraction, multiplanar Canvas viewer (axial/coronal/sagittal), 4-tier risk assessment (hemorrhage/fracture/NEC/tumor), FHIR R4 export, serial study comparison
- **CT Use Cases**: Preemie IVH, pediatric fractures, abdominal emergencies (NEC/appendicitis), oncology staging
- **MRI Brain Analysis**: Radiation-free 3D brain MRI pipeline with T1/T2/DTI/SWI/FLAIR multi-sequence support, brain age gap prediction, white matter FA scoring, cortical thickness, ventricular ratio, myelination assessment, AI motion correction, FHIR R4 export, longitudinal brain age tracking
- **MRI Use Cases**: Neurodevelopmental delay (brain age gap), white matter tract integrity, myelination progression, ventriculomegaly screening
- **Models Dashboard**: /medgemma-models shows full model registry with benchmarks and deployment strategy

## Wearable Health Monitor IoT
- **WearableContext** (`src/app/wearable/WearableContext.tsx`): Provider managing device connection (Web Bluetooth API + mock fallback), metrics state, trend data, auto-reconnection via localStorage
- **Clinical Engine** (`src/app/wearable/clinicalEngine.ts`): 5-domain risk assessment with age-adjusted thresholds (HRV RMSSD, steps/day, sleep hours, SpO2, falls/hr), ICD-10 code assignment, FHIR R4 Observation export, percentile computation
- **Mock Data** (`src/app/wearable/mockWearableData.ts`): Seeded RNG generator for realistic wearable metrics by age, 7-day trend generation, 30% concern scenario probability, 3 mock devices (Owlet/Fitbit/Apple Watch)
- **Wearable Dashboard** (`src/app/screens/WearableDashboard.tsx`): 5-metric grid (Activity/HRV/Sleep/SpO2/Falls), risk banner with composite score, 7-day area charts (Recharts), connected device list with battery, clinical findings with ICD-10 codes, recommendations
- **HRV Analysis** (`src/app/screens/WearableHRVScreen.tsx`): Autonomic maturity screening with zone classification (High Stress/Moderate/Normal/Excellent), 7-day HRV trend with reference areas, pediatric maturity curve (P5/P50/P95), 5 clinical indicators (vagal tone, sympathovagal balance, stress response, maturity index, recovery capacity)
- **Clinical Thresholds**: HRV <15ms (autonomic, 92% sensitivity), Steps <800@15mo (motor, 88%), Sleep <10h@24mo (cognitive, 85%), SpO2 <92% (coordination, 89%), Falls >3/hr@18mo (balance, 90%)
- **FHIR Integration**: All metrics exported as FHIR R4 Observations with LOINC codes (80404-7, 55423-8, 93832-4, 2708-6, 52488-0)
- **Navigation**: Tab bar entry ("Wearable"), dashboard quick action card, /wearable and /wearable-hrv routes

## Blockchain Audit Trail (Web3Auth + Polygon Mumbai)
- **BlockchainContext** (`src/app/blockchain/BlockchainContext.tsx`): Provider managing wallet connection (Web3Auth mock), screening anchoring, audit trail, and on-chain statistics with localStorage persistence
- **Blockchain Utils** (`src/app/blockchain/blockchainUtils.ts`): Hash computation (screening + report), mock transaction/wallet generation, localStorage CRUD for records and audit entries, integrity verification
- **BlockchainCard** (`src/app/components/BlockchainCard.tsx`): Reusable component for anchoring screenings on-chain, shows screening/report hashes, wallet address, transaction confirmation with PolygonScan link
- **BlockchainAuditScreen** (`src/app/screens/BlockchainAuditScreen.tsx`): Full audit dashboard with wallet management, on-chain statistics (records anchored, integrity score, gas used, cost), audit trail with risk levels, transaction history with block numbers/confirmations
- **Integration**: BlockchainCard embedded in ScreeningResults page, Dashboard quick action card, /blockchain-audit route, BlockchainProvider wrapped in App.tsx
- **Specs**: Polygon Mumbai testnet, ~50k gas/tx, ~$0.01/tx, non-custodial Web3Auth wallet, tamper-proof clinical record anchoring

## Mock Data System (500+ Scenarios)
- **Child Profiles** (`src/mock-data/child-profiles.ts`): 50+ diverse child names with sex, language, region. CHW names, clinic locations. Seeded RNG utilities for deterministic generation.
- **Clinical Observations** (`src/mock-data/observations.ts`): Domain-specific observations across 9 age bands (0-3mo through 49-60mo) for 5 developmental domains (communication, gross_motor, fine_motor, problem_solving, personal_social). Each domain has 4 severity levels (on_track, monitor, concern, red_flag) with clinically accurate observation text. Includes ICD-10 code mappings and evidence-graded recommendations by risk level.
- **Screening Scenarios** (`src/mock-data/screening-scenarios.ts`): Generates 500+ deterministic screening scenarios with seeded RNG. Each scenario includes: child demographics, domain-specific observations, CHW notes, risk levels (weighted: 40% on_track, 30% monitor, 18% urgent, 12% referral), ASQ-3 scores/percentiles, ICD-10 codes, key findings, clinical summaries, recommendations with priority/timeline/evidence, domain breakdowns, preemie cases, timestamps, and model inference metadata.
- **Data Integration** (`src/app/data/mockData.ts`): Re-exports scenario data as Patient records, computes aggregate statistics (risk counts, domain counts, age distribution, avg confidence/inference time), feeds Dashboard mock dataset card and Impact Dashboard.
- **Utility Functions**: `getScenariosByRisk()`, `getScenariosByDomain()`, `getScenariosByAgeRange()`, `getScenarioStats()`, `getRecentScreenings()` for filtering and analytics.

## External Dependencies
- **UI Libraries**: Radix UI, Lucide icons, Recharts, Framer Motion
- **Package Manager**: pnpm
- **QR Code Generation**: `qrcode.react` library for QR code rendering.
- **Offline Storage**: IndexedDB (native browser API).
- **Camera Access**: `getUserMedia` API.
- **Haptic Feedback**: Web Vibration API.
- **Notifications**: Notification API.
- **PWA Support**: Web App Manifest and Service Worker APIs.
- **Barcode Scanning**: BarcodeDetector API.