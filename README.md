# 🌊 FloodLens AI — Himalayan Flood Impact & Road Connectivity Analyzer

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Gemini API](https://img.shields.io/badge/Google_GenAI-Gemini_Flash-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade, satellite-powered disaster intelligence and rapid road connectivity assessment platform specifically engineered for complex Himalayan river valleys and flash flood scenarios (e.g., Wayanad, Chamoli, Sikkim Lhonak GLOF, Teesta River).

FloodLens AI combines **Sentinel-1 SAR (Synthetic Aperture Radar)** all-weather flood change detection, **Copernicus DEM (30m)** hydraulic flow-path modeling, pre-event **OpenStreetMap infrastructure vector overlays**, and an AI-powered **Situation Report (SitRep) Copilot** grounded strictly in satellite telemetry.

---

## 🌟 Key Features

### 1. 🛰️ All-Weather Satellite Inundation & Debris Mapping
- **Sentinel-1 SAR C-Band**: Overcomes heavy cloud, monsoon cover, smoke, and nighttime barriers using calibrated radar backscatter change detection ($\Delta \sigma^0 \le -2.5\,\text{dB}$).
- **Monsoon & GLOF Debris Tracking**: Detects high-roughness boulder and debris deposits alongside open-water flood extent.
- **Permanent Water Masking**: Isolates new inundation from historical baseline water bodies using Copernicus Water and Sentinel-2 baseline indices.

### 2. 🏔️ Copernicus DEM 30m Hydraulic Flow-Path Modeling
- **Interactive Seed Elevation Trace**: Calculates deterministic D8 steepest descent flow routes from glacial lakes, breach seeds, or high-altitude cloudburst zones.
- **Topographic Constriction Analysis**: Identifies gorge pinch-points, valley choke hazards, and downslope inundation corridors.

### 3. 🛣️ Pre-Event Infrastructure Exposure & Breach Assessment
- **OpenStreetMap Overlays**: Automatically flags inundated road segments, bridge crossings, culverts, schools, medical centers, and residential clusters.
- **Severity Classification**:
  - 🔴 **CRITICAL**: Major transport arterial severance or isolated health facilities.
  - 🟠 **HIGH**: Secondary link submerged or unpaved mountain access roads blocked.
  - 🟡 **MODERATE**: Minor access roads with accessible alternative paths.

### 4. 🏥 Settlement Isolation & Evacuation Connectivity Analysis
- **Graph-Based Road Network Analysis**: Evaluates post-event network graphs to determine if settlements have viable emergency routes to district hospitals and relief camps.
- **Isolated Settlements Alert**: Clearly tags villages as **NO ROUTE FOUND (Isolated)** or **Detour Required** with calculated distance penalties.

### 5. 🤖 Grounded Situation Report Copilot (Gemini API)
- **Strictly Grounded Telemetry**: Gemini 2.5/Flash model analyzes detected flood boundaries, severed lifelines, and cut-off settlements without speculative hallucination.
- **Actionable SitRep Generation**: Outputs immediate tactical action items, evacuation priorities, field verification disclaimers, and printable UN/NDMA disaster summaries.

### 6. 📱 Enterprise Mobile-First & Dark/Light Theme Design
- **Tactile Mobile Navigation**: Mobile bottom dock with quick switching between Analysis, Interactive Maps, Infrastructure, AI Copilot, and SitRep.
- **Theme Support**: Smooth transitions between Dark (command-center tactical mode) and Light (field day-view) palettes.

---

## 🏗️ Architecture

```
├── server.ts                    # Express full-stack API & server-side Gemini client
├── src/
│   ├── components/              # UI components
│   │   ├── BottomNav.tsx        # Mobile app navigation bar
│   │   ├── Header.tsx           # Global header with theme toggle & active badge
│   │   ├── Sidebar.tsx          # Desktop drawer navigation
│   │   ├── MapViewer.tsx        # Satellite & vector geospatial canvas
│   │   ├── AreaPickerMap.tsx    # Interactive Bounding Box & preset selector
│   │   └── WhyModal.tsx         # Explainability modal for satellite logic
│   ├── context/
│   │   └── ThemeContext.tsx     # Theme state provider (dark / light)
│   ├── pages/                   # Application pages & modules
│   │   ├── HomePage.tsx         # Disaster intake, area & flood date selection
│   │   ├── AnalysisPage.tsx     # 10-step verified satellite processing pipeline
│   │   ├── FloodMapPage.tsx     # Interactive flood & DEM flow map
│   │   ├── InfrastructurePage.tsx # Road & bridge vulnerability table
│   │   ├── ConnectivityPage.tsx # Hospital access & isolated village status
│   │   ├── AIAnalysisPage.tsx   # Grounded Gemini SitRep Copilot
│   │   ├── ReportPage.tsx       # Printable official disaster dossier
│   │   ├── DataSourcesPage.tsx  # Satellite metadata, orbits & attribution
│   │   └── LimitationsPage.tsx  # Caveats (radar shadow, DEM resolution, etc.)
│   └── services/
│       ├── api.ts               # Frontend API client
│       └── verifiedFloodPipeline.ts # Satellite verification & hydraulic logic
└── index.html                   # HTML entry point with metadata
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** or **yarn**

### 1. Clone Repository
```bash
git clone https://github.com/your-username/floodlens-ai.git
cd floodlens-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file from the example template:
```bash
cp .env.example .env
```

Edit `.env` and configure your keys:
```env
# Google Gemini API Key for Situation Report Copilot
GEMINI_API_KEY="your-gemini-api-key"

# Optional Google Maps API key (if using Google Maps basemaps)
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

> **Note**: Even without API keys, FloodLens AI operates in verified algorithmic fallback mode with pre-calibrated Himalayan disaster historical sets (Chamoli, Teesta, Wayanad, Kedarnath).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🛰️ Satellite & Data Sources

| Layer | Source | Spatial Resolution | Refresh Rate |
| :--- | :--- | :--- | :--- |
| **SAR Inundation** | Sentinel-1 C-SAR (Copernicus) | 10m / pixel | 6–12 days |
| **Terrain Elevation** | Copernicus DEM GLO-30 | 30m | Static global |
| **Road & Village Vectors** | OpenStreetMap (OSM) Contributors | Vector nodes/ways | Continuous |
| **Optical Verification** | Sentinel-2 MSI (Cloud checked) | 10m | 5 days |

---

## 🛡️ Field Verification Disclaimer

> **IMPORTANT**: Satellite remote sensing in mountainous Himalayan terrain is subject to radar layover, shadow, geometric distortion in steep gorges, and DEM smoothing. All detected road severances and flood extents must be cross-verified by local emergency management personnel, aerial reconnaissance, or ground teams prior to deploying heavy rescue machinery.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
