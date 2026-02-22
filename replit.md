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

## Edge AI Architecture
- **EdgeAiEngine**: Orchestrates on-device inference and summary generation via pluggable LocalModelRuntime interface
- **MockRuntime**: Demo runtime with simulated 300-600ms latency, produces realistic risk classifications
- **Feature Encoding**: Converts ScreeningSession answers to normalized float vectors for model input
- **EdgeStatusContext**: React context providing model readiness state, warmup status, inference count
- **Integration**: Edge AI toggle on ScreeningSummary, results persisted through submitSession() override
- **Diagnostics**: /edge-diagnostics route shows model info, benchmark latency, runtime metrics
- **Provenance**: Edge results tagged with "medgemma-pediscreen-edge" model ID

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