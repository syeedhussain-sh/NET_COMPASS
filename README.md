# Network Compass 🧭

**Network Compass** is a full-stack cellular radio frequency (RF) telemetry monitoring, propagation intelligence, and link benchmarking dashboard designed for an Electronics and Communication Engineering (ECE) hackathon demonstration.

The system models cellular physical and link-layer behavior—including Reference Signal Received Power (**RSRP**), Reference Signal Received Quality (**RSRQ**), Signal-to-Interference-plus-Noise Ratio (**SINR**), Channel Quality Indicator (**CQI**), and Carrier Aggregation across **4G LTE** and **5G NR** spectrum bands.

---

## 🚀 Key Features

The prototype features a responsive dashboard with 10 connected modules:

1. **Dashboard (Executive Cockpit)**: Real-time link status, radio access technology (RAT), 5-bar cellular signal meter, network quality index, throughput metrics, recent measurements log, and quick-action navigation cards.
2. **Network Overview**: Deep-dive physical link telemetry including RSRP, RSRQ, SINR, packet delay variation (jitter), and frame drop rate.
3. **Cellular RF Network Scanner**: Simulated RF spectrum sweep with interactive stage progress indicators across Sub-6 GHz (e.g. Band n78) and LTE bands. Displays serving and neighbor cell towers with PCI, TAC, PLMN, and signal strength.
4. **Signal Monitoring**: Real-time signal strength gauge (in dBm), 5-bar visualization, 3GPP cellular classification standards reference table, and RF link budget parameters.
5. **4G / 5G Radio Mode Selector**: Dynamic profile switching engine between **5G mmWave (FR2)**, **5G Sub-6 GHz (FR1)**, **4G LTE-Advanced (Carrier Aggregation)**, and **4G LTE Standard**, immediately updating all dashboard measurements.
6. **Speed & Latency Benchmark**: Interactive throughput benchmark test bench featuring an animated speedometer gauge dial, multi-phase testing (Ping -> Downlink -> Uplink -> Report), and session history.
7. **Geographic Coverage Heat Map**: Interactive OpenStreetMap / Leaflet geographic view displaying RF propagation density bubbles, transmitter towers, customizable layer toggles (Density & Nodes, Heatmap, Nodes), and clickable tower inspector popups.
8. **Network History & Analytics**: Time-series telemetry trend charts (powered by Recharts) showing longitudinal signal levels, throughput fluctuations, and transmission latency over rolling time windows.
9. **Offline Mode & Local Storage Cache**: Disconnected operation simulation modeling subterranean tunnels or remote dead-zones. Preserves and displays cached telemetry snapshots from `localStorage` with visual offline badges.
10. **Settings & Diagnostic Center**: Configurable telemetry auto-polling rates (Manual, 3s, 5s, 10s), cache purging, live backend health check ping, and telemetry timeout diagnostics.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 (`react`, `react-dom`)
  - Vite 8 (Modern build tool & dev server with reverse proxy)
  - Recharts 3 (Time-series data visualization)
  - Leaflet 1.9 (Interactive RF geographic mapping)
  - Custom CSS3 design system with cyber-engineering dark aesthetic
  - Oxlint (Ultra-fast code linter with 0 warnings)
- **Backend**:
  - Node.js (ES Modules)
  - Express.js 4 (Modular REST API)
  - CORS middleware
  - Dotenv configuration
- **Data & Simulation**:
  - Correlated RF mathematical simulation modeling path loss, throughput, and latency
  - In-memory rolling history buffer & browser `localStorage` caching

---

## 📁 Repository Structure

```text
Netcompass-AG/
├── backend/
│   ├── src/
│   │   ├── config/               # Environment & port configuration
│   │   ├── controllers/          # Request handlers
│   │   │   ├── coverageController.js
│   │   │   ├── healthController.js
│   │   │   ├── scannerController.js
│   │   │   ├── speedtestController.js
│   │   │   └── telemetryController.js
│   │   ├── middleware/           # 404 & error handling
│   │   │   └── errorHandler.js
│   │   ├── routes/               # API route definitions
│   │   │   ├── coverageRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   ├── index.js
│   │   │   ├── scannerRoutes.js
│   │   │   ├── speedtestRoutes.js
│   │   │   └── telemetryRoutes.js
│   │   ├── services/             # Business & simulation logic
│   │   │   ├── coverageService.js
│   │   │   ├── healthService.js
│   │   │   ├── scannerService.js
│   │   │   ├── speedtestService.js
│   │   │   ├── telemetryHistoryService.js
│   │   │   └── telemetryService.js
│   │   └── server.js             # Express application entry point
│   ├── .env                      # Backend environment variables
│   └── package.json              # Backend dependencies
├── public/                       # Static public assets (icons, SVG)
├── src/
│   ├── assets/                   # Static images & graphics
│   ├── components/               # React UI components
│   │   ├── dashboard/            # Dashboard widgets
│   │   │   ├── ConnectionStatus.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── NetworkOverview.jsx
│   │   │   ├── NetworkType.jsx
│   │   │   └── SignalStrength.jsx
│   │   ├── CoverageMap.jsx       # Leaflet RF Heat Map
│   │   ├── MainDashboardView.jsx # Executive Dashboard & Module Hub
│   │   ├── Navbar.jsx            # Responsive navigation bar
│   │   ├── NetworkModeSelector.jsx # 4G/5G profile switcher
│   │   ├── NetworkScanner.jsx    # RF spectrum scanner
│   │   ├── OfflineModeView.jsx   # Offline cache simulation
│   │   ├── SettingsAboutView.jsx # Settings & diagnostic reports
│   │   ├── SignalMonitor.jsx     # RSRP/RSRQ/SINR monitoring
│   │   ├── SpeedTestView.jsx     # Speedometer benchmark bench
│   │   └── TelemetryHistory.jsx  # Recharts time-series charts
│   ├── services/                 # API client & offline fallback
│   │   ├── api.js                # Centralized fetch service with timeout & retry
│   │   └── mockFallback.js       # Offline resilient mock provider
│   ├── App.css                   # Global component & layout styling
│   ├── App.jsx                   # Application root & tab routing
│   ├── index.css                 # Global CSS variables & resets
│   └── main.jsx                  # React DOM entry point
├── package.json                  # Root npm configuration & scripts
├── vite.config.js                # Vite config with /api reverse proxy
└── README.md                     # Documentation
```

---

## ⚡ Installation & Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Install Dependencies

Install root (frontend) dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

---

## 🏃 Running the Prototype

### Option A: Run Backend and Frontend Concurrently (Recommended)

In terminal 1 (start the Backend API on port 5000):
```bash
npm run server
```

In terminal 2 (start the Vite dev server on port 5173):
```bash
npm run dev
```

### Option B: Local URLs
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend server health check & uptime |
| `GET` | `/api/telemetry/current` | Active RF link snapshot with RSRP, throughput, & quality |
| `GET` | `/api/telemetry/history` | Rolling chronological telemetry records (`?limit=60`) |
| `GET` | `/api/telemetry/profiles` | List of available 4G/5G simulation profiles |
| `POST` | `/api/telemetry/profile` | Switch active profile (`{ profileId: "5g-mmwave" }`) |
| `POST` | `/api/scanner/scan` | Trigger RF spectrum sweep & discover cell towers |
| `GET` | `/api/scanner/history` | Retrieve past RF scan session logs |
| `POST` | `/api/speedtest/run` | Execute simulated throughput & ping benchmark |
| `GET` | `/api/speedtest/history` | Retrieve speed test benchmark run history |
| `GET` | `/api/coverage/points` | Geographic coverage nodes and propagation sectors |

---

## 🔍 Telemetry Timeout Diagnosis & Resolution

### Exact Root Cause:
1. **Application-Level Cause**:
   - The frontend API service originally attempted to query `http://localhost:5000/api/telemetry/current` with an abort timeout of 6 seconds.
   - During initial runs, only the Vite frontend dev server (`npm run dev` on port 5173) was started; the backend server process on port 5000 was inactive.
   - Consequently, requests failed to connect or timed out, triggering:
     `"Telemetry request timed out. Please check monitoring connection."`
2. **Resolution Implemented**:
   - Configured a Vite reverse proxy (`/api` &rarr; `http://localhost:5000`) in `vite.config.js`.
   - Added npm scripts (`npm run server` and `npm run dev:server`) in root `package.json`.
   - Built resilient timeout handling and automatic fallback to `src/services/mockFallback.js`. If the backend is ever stopped, the UI transitions gracefully into **Offline Demo Mode** without halting or crashing.

### Antigravity IDE Telemetry (Separate from App):
- Antigravity IDE is built on a VS Code-derived runtime. If your workstation or firewall blocks corporate telemetry endpoints, the IDE logs a background telemetry timeout.
- **IDE Setting Menu Path**: `File > Preferences > Settings > Application > Telemetry > Telemetry Level` (can be set to `off` or `error`).
- **Important**: Network Compass is 100% independent of IDE telemetry and functions completely without it.

---

## ⚠️ Demo Data & Limitations

1. **Simulated Telemetry**: Measurements (RSRP dBm, RSRQ dB, SINR, CQI, Mbps, ping ms) are mathematically generated using wireless communications models (path loss exponent and standard 3GPP thresholds). They do not represent real physical cell tower transmissions.
2. **Hardware Boundaries**: Web browsers cannot directly access low-level smartphone baseband radios or PCIe cellular modems without specialized kernel drivers (e.g. QXDM or SDR). The app's controls model network layer behaviors for ECE academic presentation.
3. **Speed Test Benchmark**: Throughput tests are link simulations calibrated to the selected radio profile; they do not consume real WAN bandwidth or test external ISP gateways.

---

## 👥 Hackathon Team & Project Info

- **Project**: Network Compass
- **Category**: Telecommunications / Wireless RF Engineering
- **Department**: Electronics and Communication Engineering (ECE)
