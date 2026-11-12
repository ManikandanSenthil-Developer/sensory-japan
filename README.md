# SENSORY JAPAN (センサリー・ジャパン)
> **Japanese Residential Architectural CAD, Tatami Modular Engine & Interactive 3D Planning Platform**

[![Vite](https://img.shields.io/badge/Vite-v8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.187-black?logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🏛️ Overview

**SENSORY JAPAN** is a professional architectural CAD and residential planning SaaS tailored specifically to the structural, aesthetic, and regulatory realities of modern and traditional Japanese timber construction (*Zairai Jikugumi* 在来軸組構法).

It bridges traditional Japanese architectural modularity with real-time 3D WebGL computer graphics and statutory compliance auditing under the **Japanese Building Standards Act (建築基準法)**.

---

## ✨ Key Capabilities

### 1. 📐 Authentic Japanese Tatami Engine & Shakkan-ho Module
- **4 Regional Tatami Systems**: Kyoma (京間 1910×955mm), Chukyoma (中京間 1820×910mm), Edoma (江戸間 1760×880mm), and Danchima (団地間 1700×850mm).
- **Auspicious Shukugi-jiki (祝儀敷き) Layouts**: Automatic layout generation for 3, 4.5, 6, 8, and 10-jo rooms avoiding unlucky four-mat vertex crossings (*Fushukugi-jiki*).
- **Tsubo & Advertising Conversions**: Exact real-estate calculations adhering to the Fair Trade Commission 1.62 m²/jo convention.

### 2. 🏛️ Japanese Building Standards Act (BSL / 建築基準法) Live Audit
- **Article 53 (建ぺい率 / BCR)**: Building Coverage Ratio monitoring against municipal zoning caps.
- **Article 52 (容積率 / FAR)**: Floor Area Ratio calculation factoring in front road width reduction coefficients.
- **Article 42 Section 2 (道路後退 / Setback)**: Automatic 2m center-line setback enforcement on narrow access roads.
- **Article 21 (天井高 / Ceiling Clearance)**: Habitable room clearance ($\ge 2,100\text{ mm}$).
- **Article 23 (階段寸法 / Stair Dimensions)**: Residential stairs validation (Width $\ge 750\text{ mm}$, Riser $\le 230\text{ mm}$, Tread $\ge 150\text{ mm}$).
- **Article 28 (有効採光 / Daylighting Ratio)**: Daylighting opening ratio checking ($\ge 1/7$ floor area).
- **Article 43 (接道義務 / Road Frontage)**: 2-meter frontage legal access verification.

### 3. 🌐 Full 360° Interactive Three.js 3D Viewport
- **Unrestricted 360° Turntable Orbit**: Horizontal and vertical rotation inspecting roofs, timber post-and-beam frames, and concrete mat foundations (*Betakiso*).
- **Architectural Elevation Presets**: One-click smooth camera interpolation to Top, Front, Back, Left, Right, and Isometric views.
- **Multi-Floor Modes**: Full building, Floor-isolated, Exploded floor stack (3.8m vertical separation), and 1.2m Horizontal Cutaway.
- **Procedural PBR Materials**: Authentic woven rush tatami with cloth borders (*Heri*), Hinoki cypress, Sugi cedar, Kawara roof tiles, Shikkui plaster, Shoji paper, and concrete Doma.
- **Dynamic Solar Lighting**: True-North solar azimuth simulation (Morning, Solar Noon, Sunset Golden Hour, Night).

### 4. 🤖 AI Architectural Design Assistant
- Natural language to structured CAD operation parser (`add_room`, `resize_room`, `change_tatami_count`, `add_engawa`, `change_roof`).
- Non-destructive execution with instant regulatory re-audit.

### 5. 💰 Residential Cost Estimator (JPY)
- Real-time construction budget estimation based on Japanese *Tsubo-tanka* (坪単価) with itemized breakdown across foundation, framing, finishes, and MEP.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/sensory-japan.git
cd sensory-japan

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

### Build for Production
```bash
npm run build
```

### Run Architectural Test Suites
```bash
# Engineering fixes & elevation cascade verification (47/47 tests)
npx tsx src/engine/__tests__/engineering_fixes.test.ts

# 360° Viewport camera acceptance tests (21/21 tests)
npx tsx src/engine/__tests__/viewport_360.test.ts

# Tatami mathematics & Shukugi-jiki layout tests
npx tsx src/engine/__tests__/tatami.test.ts
```

---

## 📁 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── canvas2d/        # Interactive 2D SVG CAD Floor Plan Canvas & Snapping
│   │   ├── canvas3d/        # Three.js 360° Architectural House Builder & Camera Viewport
│   │   ├── layout/          # Navigation, Header CAD Toolbar, Inspector & Validation Panel
│   │   ├── ui/              # Modals (New Project, AI Assistant, Dossier Export)
│   │   └── views/           # Dashboard, Site Analysis, Compliance, History, Reports, Settings
│   ├── engine/
│   │   ├── ArchitecturalConstraintEngine.ts # Hard & Soft CAD Boundary Constraints
│   │   ├── BuildingCoordinateSystem.ts       # Unified Millimeter Datum & Centroid Anchor
│   │   ├── compliance.ts                     # Japanese Building Standards Act Auditor
│   │   ├── costEstimator.ts                  # JPY Construction Cost Estimator
│   │   ├── FloorElevationManager.ts          # Vertical Floor Datums & Elevation Cascade
│   │   ├── GeometryValidationService.ts      # Transactional Editing Validation Guards
│   │   ├── materials3d.ts                    # Procedural Japanese Architectural Textures
│   │   ├── sceneBuilder3d.ts                 # Dynamic 3D Geometry Synthesizer
│   │   ├── StaircaseGeometryGenerator.ts     # BSL Art. 23 Parametric Stairs & Slabs Void
│   │   └── tatami.ts                         # 4 Regional Systems & Shukugi-jiki Engine
│   ├── data/                # 8 Authentic Japanese Residential Templates
│   └── store/               # Zustand CAD Stores with Undo/Redo & LocalStorage
├── recordings/              # Full 1080p Product Walkthrough Video (WebM)
├── index.html               # Main HTML Shell
└── package.json             # App Metadata & Dependencies
```

---

## 📄 License
Private & Confidential — SENSORY Architectural Systems.
