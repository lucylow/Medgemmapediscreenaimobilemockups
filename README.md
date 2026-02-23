# PediScreen AI - Mobile Mockups

A comprehensive mobile-first web application showcasing CHW (Community Health Worker) field-optimized interface for pediatric screening using MedGemma AI.

## 🎨 Design System

### Color Hierarchy (Medical Risk)
- **🔴 #EA4335 REFERRAL** - Immediate specialist referral required
- **🟠 #FF9800 URGENT** - 72-hour intervention needed
- **🟡 #FBBC05 MONITOR** - 30-day CHW follow-up
- **🔵 #34A853 ON-TRACK** - 6-month routine screening

### Design Principles
- ✅ 60px+ touch targets (gloved hands, field conditions)
- ✅ Thumb-zone priority (35% bottom screen)
- ✅ Risk-first layout (RED → Referral always top)
- ✅ 2-tap screening flow
- ✅ Mobile-optimized (430x932px iPhone 15 Pro Max)

## 📱 Screen Flow (13 Complete Screens)

### Onboarding (3 screens)
1. **Welcome** - `/` 
   - Kaggle Gold certification badge
   - $100K lifetime savings hero
   - Progress dots (1/4)

2. **Permissions** - `/permissions`
   - Camera, Mic, Location, Notifications
   - One-tap grant all
   - Progress dots (2/4)

3. **Authentication** - `/auth`
   - CHW biometric login
   - Face ID / Fingerprint
   - Progress dots (3/4)

### Main Application

4. **Dashboard** - `/dashboard` (Risk-First Layout)
   - Risk hero cards (Referral, Urgent, Monitor, On-Track)
   - High-priority patient list
   - Quick actions (Scan QR, New Screening, Sync)
   - Thumb-zone optimized actions

5. **Patient Detail** - `/patient/:id`
   - Risk banner
   - Patient demographics
   - Quick actions (Call, Video, Message)
   - Medical records navigation

6. **New Screening** - `/new-screening` (2-Tap Flow)
   - Age wheel selector (0-60 months)
   - Domain selection (Communication, Motor, etc.)
   - Interactive sliders and buttons

7. **QR Scanner** - `/qr-scanner`
   - Live camera simulation
   - Real-time QR detection
   - Scanning animations
   - Patient data loading

8. **Camera Mode Selection** - `/camera-screening`
   - ROP Detection (Retinopathy)
   - Behavioral Analysis (ASQ-3)
   - Bone Age X-Ray
   - Color-coded mode cards

9. **ROP Camera** - `/rop-camera`
   - Live quality meter (0-100%)
   - Zone overlay (Zone II Stage 2)
   - Real-time positioning feedback
   - Auto-capture when optimal

10. **Behavioral Analysis** - `/behavioral-analysis`
    - Live ASQ-3 assessment
    - Milestone checklist
    - Joint attention tracking
    - Real-time pass/fail indicators

11. **Risk Results** - `/results/:id`
    - Dynamic risk banner
    - MedGemma confidence score
    - ASQ-3 scores & Z-scores
    - Clinical recommendations (1-2-3 priority)
    - Action buttons (Call, Share, PDF)

12. **Impact Dashboard** - `/impact`
    - $15.9M lifetime savings
    - 1,592 children screened
    - 32% early detection rate
    - CHW leaderboard (gamification)
    - Program ROI metrics

13. **Longitudinal Growth** - `/longitudinal/:id`
    - 6-month growth timeline
    - Height/Weight percentiles
    - Bone age tracking
    - X-ray series carousel
    - Interactive charts (Recharts)

## 🚀 Key Features

### Risk-First Architecture
- High-risk patients always shown first
- Color-coded risk levels throughout
- One-tap emergency actions

### 2-Tap Screening Flow
1. Scan QR → Patient loads
2. Start Camera → MedGemma analysis → Risk result

### Touch-Optimized
- All buttons 60px+ height
- Bottom 35% reserved for primary actions
- Active state animations
- Haptic-ready transitions

### Field-Ready Design
- Works on gloved hands
- High contrast for outdoor viewing
- Offline-capable architecture
- Quick sync functionality

## 🛠️ Technical Stack

- **React 18** with TypeScript
- **React Router 7** for navigation
- **Tailwind CSS 4** for styling
- **Motion** (Framer Motion successor) for animations
- **Recharts** for data visualization
- **Lucide React** for icons

## 📊 Mock Data

- 6 patient records across all risk levels
- Real-world screening scenarios
- Growth tracking data
- CHW leaderboard
- Impact metrics ($15.9M+ savings)

## 🎯 Use Cases

1. **Community Health Worker** - Field screening workflow
2. **Medical Demonstration** - Risk assessment visualization
3. **Impact Reporting** - ROI dashboard for stakeholders
4. **Clinical Training** - Mobile interface patterns
5. **Kaggle Submission** - MedGemma Impact Challenge

## 📱 Mobile Optimization

- Locked to mobile viewport (430x932px)
- Touch event optimization
- No text selection (except inputs)
- Tap highlight disabled
- Smooth animations and transitions

## 🔄 Navigation Flow

```
Welcome → Permissions → Auth → Dashboard
                                    ↓
                    ┌───────────────┴────────────────┐
                    ↓                                ↓
            Patient Detail                    Impact Dashboard
                    ↓
        ┌───────────┴────────────┐
        ↓                        ↓
  Risk Results          Longitudinal Growth
        ↓
  New Screening
        ↓
  Camera Modes → ROP/Behavioral → Results
```

## 🎨 Component Library

- **MobileContainer** - iPhone 15 Pro Max frame (430x932px)
- **RiskBanner** - Dynamic color + pulse animation
- **PrimaryButton** - 60px height, 4 variants
- **Mock Data** - Realistic patient scenarios

---

**Built for:** MedGemma Impact Challenge - Kaggle Gold Submission  
**Design System:** CHW Field-Optimized • Risk-First • Thumb-Zone Priority  
**Status:** Production-ready mobile mockups ✅
