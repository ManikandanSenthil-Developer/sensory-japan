# LandSense Architecture, Endpoints & System Workflow

This document provides a comprehensive technical analysis of the **LandSense** application, detailing its architectural design, internal workings, end-to-end user workflows, navigation routes, and backend API endpoints.

---

## 1. Project Overview

**LandSense** is an AI-powered architectural mobile application built with **React Native** and **Expo (SDK 54)**. It allows architects, builders, and land buyers to photograph or upload a plot of land and instantly generate:
- Automated site context analysis (area, terrain, soil, road access, solar orientation).
- 2D interactive architectural floor plans conforming to Indian National Building Code (NBC 2016) and Vastu Shastra principles.
- Real-time compass-based solar orientation.
- Preliminary cost estimations (in INR, formatted in Lakhs/Crores).
- Interactive conversational AI refinement to modify room parameters on the fly.
- Exportable architectural reports (PDF).

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Framework & Core** | React 19.1.0, React Native 0.81.5, Expo ~54.0.33 |
| **Routing / Navigation**| Expo Router v6 (File-based routing with Stack & Tabs) |
| **Styling & Theming** | Custom Theme Engine (`ThemeContext`), NativeWind 4.2.3, TailwindCSS 3.3.2 |
| **Typography & Assets**| `@expo-google-fonts` (`Syne`, `DM Sans`, `Jost`, `Cormorant`), Expo Vector Icons (Feather) |
| **Sensors & Hardware** | `expo-camera`, `expo-image-picker`, `expo-location`, `expo-sensors` (Magnetometer) |
| **Graphics & Charts**  | `react-native-svg` (15.12.1), `react-native-reanimated` (~4.1.1), `react-native-gifted-charts` |
| **Persistence**        | `@react-native-async-storage/async-storage` |
| **HTTP Client**        | `axios` (^1.16.0) with custom request/response interceptors |
| **File Sharing**       | `expo-file-system`, `expo-sharing` |

---

## 3. Full Endpoints Reference

The application interfaces with both **Backend REST API endpoints** and **Frontend Navigation routes (Expo Router)**.

### 3.1. Backend REST API Endpoints

The network client is configured in `services/api.ts` with Axios.
- **Base URL**: Configured via environment variable `EXPO_PUBLIC_API_URL` (Defaults to: `https://api.landsense.app`).
- **Global Timeout**: 60 seconds (extended to 120s for image processing).
- **Request Interceptor**: Supports bearer token injection.
- **Response Interceptor**: Global logging and error normalization.

| # | Endpoint | Method | Content-Type | Payload / Params | Response | Description |
|---|---|---|---|---|---|---|
| 1 | `/api/analyze` | `POST` | `multipart/form-data` | `FormData` (see schema below) | `AnalyzeResponse` (JSON) | Uploads land photograph, coordinates, and criteria for AI computer vision & plan synthesis. |
| 2 | `/api/export-pdf` | `POST` | `application/json` | `{ analysisId: string }` | `Blob` (`application/pdf`) | Generates and streams down a complete PDF architectural dossier for the specified analysis ID. |
| 3 | `/api/history` | `GET` | `application/json` | None | `AnalyzeResponse[]` (JSON) | Fetches the user's remote cloud history of past site analyses and generated designs. |
| 4 | `/api/refine` | `POST` | `application/json` | `{ analysisId: string, message: string }` | `AnalyzeResponse` (JSON) | Sends user conversational prompts to the AI engine to update layout, room sizes, or compliance rules. |

#### Detailed API Schemas

##### 1. `POST /api/analyze`
- **Request (Multipart Form-Data)**:
  ```typescript
  {
    image: File;            // Key: 'image', uri, type ('image/jpeg'), name
    buildingType: string;   // 'Residential' | 'Commercial' | 'Mixed' | 'Industrial'
    plotSize?: string;      // e.g. "2400" (in sqft)
    latitude?: string;      // GPS Latitude e.g. "12.9716"
    longitude?: string;     // GPS Longitude e.g. "77.5946"
  }
  ```
- **Response Schema (`AnalyzeResponse`)**:
  ```typescript
  {
    id: string;
    siteAnalysis: {
      estimatedArea: number;     // e.g. 2400
      roadAccess: string;        // e.g. "North"
      vegetation: string;        // e.g. "Sparse"
      terrain: string;           // e.g. "Flat"
      bestOrientation: string;   // e.g. "East-facing"
      soilType: string;          // e.g. "Loamy"
    };
    floorPlan: {
      totalArea: number;
      rooms: Array<{
        id: string;
        name: string;
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
        areaSqft: number;
      }>;
      setbacks: {
        front: number;
        rear: number;
        left: number;
        right: number;
      };
    };
    compliance: {
      nbc2016: { compliant: boolean; label: string };
      vastu: { status: 'compliant' | 'partial' | 'non-compliant'; label: string };
      greenScore: number;       // 1 - 10
    };
    costEstimation: {
      minCost: number;          // e.g. 2500000 (INR)
      maxCost: number;          // e.g. 3200000 (INR)
      breakdown: Array<{
        label: string;          // "Structure" | "Finishing" | "Electrical" | "Plumbing"
        percentage: number;
        color: string;
      }>;
    };
    designRationale: string;    // Architectural narrative explaining orientation, layout logic & setbacks
  }
  ```

---

### 3.2. Frontend Application Routes (Expo Router)

All client routes are organized inside the `app/` folder:

| Route Path | File Location | Purpose & Functionality |
|---|---|---|
| `/` | `app/index.tsx` | **Splash Screen**: Animated branded intro. Reads `has_onboarded` from `AsyncStorage`. Routes to `/(tabs)/home` or `/onboarding`. |
| `/onboarding` | `app/onboarding.tsx` | **Onboarding Carousel**: 3-slide introduction to LandSense features. Sets `has_onboarded: 'true'` on completion. |
| `/(tabs)/home` | `app/(tabs)/home.tsx` | **Dashboard**: Overview cards, stats (Analyses, Plans, PDFs), quick call-to-action button, horizontal past analysis carousel, and architectural advice cards. |
| `/(tabs)/upload` | `app/(tabs)/upload.tsx` | **Capture & Parameters Form**: Camera capture (`expo-camera`), photo picker (`expo-image-picker`), EXIF GPS reader, building type switcher, and plot size input. |
| `/(tabs)/history` | `app/(tabs)/history.tsx` | **Past Analyses Archive**: Search query bar, type filtering chips (Residential, Commercial, Mixed), pull-to-refresh, item deletion, and navigation to result view. |
| `/(tabs)/profile` | `app/(tabs)/profile.tsx` | **User Settings**: Dark/Light mode switch, unit selector (`sqft` vs `sqm`), notification preferences, and account metrics. |
| `/processing` | `app/processing.tsx` | **AI Pipeline Status**: Progress bar animation, rotating architectural trivia facts, execution of `useAnalysis` hook, and navigation to `/results`. |
| `/results` | `app/results.tsx` | **Analysis Dossier**: Renders all 6 core analysis modules, compass widget, floor plan, compliance badges, cost chart, AI refinement chat, and PDF export. |
| `+not-found` | `app/+not-found.tsx` | **Fallback Screen**: 404 handler for unrecognized routes. |

---

## 4. How the Application Works (Detailed Architecture & Workflow)

```mermaid
flowchart TD
    A[Launch App /index] --> B{Already Onboarded?}
    B -- No --> C[Onboarding Screen /onboarding]
    C --> D[Home Dashboard /(tabs)/home]
    B -- Yes --> D
    
    D --> E[Upload Screen /(tabs)/upload]
    E -->|1. Capture or Select Photo| F[Extract EXIF or Device GPS]
    F -->|2. Select Building Type & Area| G[Start Analysis Trigger]
    G --> H[Processing Screen /processing]
    
    H -->|Simulated/API Pipeline Steps| I[useAnalysis Hook]
    I -->|Step 1: Preprocessing Image| I1[Extract Boundaries]
    I1 -->|Step 2: Detect Land Boundary| I2[Compute Dimensions]
    I2 -->|Step 3: Site Context & Orientation| I3[Assign Setbacks & Norms]
    I3 -->|Step 4: AI Layout Synthesizer| I4[Vastu + NBC Compliance]
    I4 -->|Step 5: Output Assembly| J[Save to AsyncStorage & Navigate]
    
    J --> K[Results Screen /results]
    
    K --> L[Site Context Cards]
    K --> M[Compass & Solar Heading]
    K --> N[Interactive Floor Plan Viewer SVG]
    K --> O[NBC & Vastu Compliance Badges]
    K --> P[Cost Breakdown Visualization]
    K --> Q[AIChatSheet Refinement Bottom Sheet]
    
    Q -->|User sends prompt| R[Update Floor Plan Layout]
    R --> N
    
    K --> S[Download PDF / Share Plan]
```

### 4.1. Core System Modules & Execution Lifecycle

#### 1. Image Ingestion & Sensor Intelligence (`upload.tsx`, `useLocation.ts`, `useCameraPermissions`)
- The user can capture photos directly using native camera controls or pick from the camera roll (`expo-image-picker`).
- **EXIF GPS Parsing**: When an image contains EXIF metadata, latitude and longitude are automatically extracted.
- **Live Device Location**: If EXIF is unavailable, `expo-location` queries device GPS coordinates and performs reverse geocoding to resolve the human-readable locality.

#### 2. Analysis Execution & Progress Pipeline (`processing.tsx`, `useAnalysis.ts`)
- The analysis pipeline coordinates 5 defined processing stages:
  1. *Preprocessing Image*: Perspective rectification and noise filtering.
  2. *Detecting Land Boundary*: Contour identification and boundary polygon calculation.
  3. *Analyzing Site Context*: Assessing road frontage, neighboring structures, slope, and solar angles.
  4. *Generating Floor Plan*: Parametric room packing using National Building Code (NBC 2016) room dimension rules.
  5. *Rendering Final Output*: Calculating cost estimates, Vastu compatibility, and aesthetic SVG paths.
- During this window, an animated progress bar and rotational educational trivia facts keep the user engaged.

#### 3. Real-Time Hardware Compass & Orientation (`CompassWidget.tsx`)
- Integrates `expo-sensors` (`Magnetometer`).
- Continuously listens for magnetic field changes `(x, y)` to calculate heading azimuth:
  $$\text{Heading} = \left(\text{atan2}(y, x) \times \frac{180}{\pi} + 360\right) \pmod{360}$$
- Falls back to `Location.getHeadingAsync` if no magnetometer hardware is detected.
- Visually shows the live heading needle superimposed with the AI-recommended building orientation (e.g. East-facing entrance for morning sunlight and Vastu compliance).

#### 4. SVG Floor Plan Generation & Dual Render Modes (`FloorPlanViewer.tsx`)
- Computes room coordinates dynamically to normalize and scale inside a vector bounding box.
- Features two rendering modes:
  - **Clean Mode**: Precise architectural vector rectangles, dimensions, and labels.
  - **Sketch Mode**: Utilizes pseudo-random trigonometric jitter (`sin(seed) * 1.5`) and blueprint textures to render hand-drafted architectural concept sketches.
- Automatically flags wet areas (bathrooms, kitchens, toilets) and displays setbacks (Front, Rear, Left, Right).

#### 5. Compliance & Building Standards Engine (`roomStandards.ts`, `mockData.ts`)
- Evaluates minimum square footage requirements defined by **NBC 2016**:
  - *Living Room*: Min 120 sqft (Rec: 180 sqft)
  - *Master Bedroom*: Min 100 sqft (Rec: 150 sqft)
  - *Kitchen*: Min 50 sqft (Rec: 80 sqft)
  - *Bathroom*: Min 18 sqft (Rec: 35 sqft)
  - *Toilet*: Min 12 sqft (Rec: 20 sqft)
- Evaluates **Vastu Shastra** alignment (e.g., placing the kitchen in the Agni / South-East corner, master bedroom in South-West, entrance in North-East).
- Computes an environmental **Green Score** out of 10 based on daylight factor and cross-ventilation.

#### 6. Interactive Conversational Refinement (`AIChatSheet.tsx`)
- A bottom sheet interface enabling natural language modification requests (e.g. *"Add a balcony"*, *"Increase living room"*, *"Make Vastu compliant"*).
- Includes instant one-tap quick suggestion chips.
- Dispatches modification prompts to `/api/refine` and live-updates the active floor plan.

#### 7. Local Persistence & State Management (`useHistory.ts`, `ThemeContext.tsx`)
- Stored keys in `@react-native-async-storage/async-storage`:
  - `has_onboarded`: Boolean flag to skip onboarding on repeat visits.
  - `theme_mode`: `'dark' | 'light'` theme persistence.
  - `unit_system`: `'sqft' | 'sqm'` dimension preferences.
  - `landsense_history`: Serialization array of full `AnalysisResult` records for offline viewing and local management.

---

## 5. File Structure Summary

```
LandSenseJp/
├── app/                        # Expo Router file-based route definitions
│   ├── _layout.tsx             # Root Stack layout, font loader & ThemeProvider
│   ├── index.tsx               # Splash screen & onboarding redirection
│   ├── onboarding.tsx          # 3-slide feature walkthrough
│   ├── processing.tsx          # 5-step analysis progress screen
│   ├── results.tsx             # Complete analysis report dashboard
│   ├── +not-found.tsx          # 404 handler
│   └── (tabs)/                 # Bottom tab navigation group
│       ├── _layout.tsx         # Bottom navigation bar configuration
│       ├── home.tsx            # Dashboard with quick actions & tips
│       ├── upload.tsx          # Camera/gallery upload & GPS tagging
│       ├── history.tsx         # Searchable local analysis archive
│       └── profile.tsx         # App settings & measurement unit toggles
├── components/                 # Reusable UI & architectural display widgets
│   ├── AIChatSheet.tsx         # Bottom sheet chat for design refinement
│   ├── CompassWidget.tsx       # Magnetometer-driven orientation compass
│   ├── CostBreakdownChart.tsx  # Cost estimation segmented bar chart
│   ├── FloorPlanViewer.tsx     # SVG floor plan renderer (Clean/Sketch)
│   ├── ProcessingSteps.tsx     # Animated progress step list
│   ├── SiteAnalysisCard.tsx    # Horizontal carousel of site attributes
│   └── ui/AnimatedPressable.tsx# Haptic-ready animated button wrapper
├── constants/                  # Configuration, tokens, and mock schemas
│   ├── colors.ts               # Architectural color palette & semantic tokens
│   ├── mockData.ts             # Sample analyses, floor plan data, & tips
│   ├── roomStandards.ts        # NBC 2016 dimensional compliance standards
│   └── typography.ts           # Type scale definitions (Syne & DM Sans)
├── context/
│   └── ThemeContext.tsx        # React Context for theme & unit systems
├── hooks/
│   ├── useAnalysis.ts          # Orchestrator for analyzing land plots
│   ├── useHistory.ts           # AsyncStorage CRUD operations for history
│   └── useLocation.ts          # Device GPS & reverse geocoding hook
├── services/
│   └── api.ts                  # Axios client & REST endpoint declarations
├── app.json                    # Expo project configuration
└── package.json                # Project dependencies & scripts
```

