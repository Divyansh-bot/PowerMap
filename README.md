# ⚡ PowerMap — AI-Powered EV Route Optimization System (Web Demo)

**PowerMap** is an AI-driven smart navigation and energy optimization system for electric and hybrid vehicles.  
It helps drivers **go farther on less charge** by analyzing **traffic, terrain, temperature, and auxiliary loads** in real time.

This repository contains the **front-end web demo** built with **React + Vite + Leaflet** for **Volkswagen iMobilothon**.

> 💡 This demo runs entirely in the browser — no backend required.  
> It uses public OSRM & Nominatim APIs for routing and geocoding.

---

## 🚗 Features

✅ **Search & Route Optimization**
- Search origin and destination like Google Maps.
- Fetch multiple route alternatives using OSRM.
- Compare routes by **energy consumption (kWh)** instead of distance/time.
- Choose the **most energy-efficient** path.

✅ **Energy Modeling**
- AI-inspired energy model estimates total power use (drive + auxiliaries).
- Considers:
  - Terrain slope
  - Traffic intensity
  - Temperature impact
  - Auxiliary loads (AC, lights, fog, music, mobile charging)
- Predicts **motor power draw (kW)** and **total kWh required**.

✅ **Simulation & Live GPS Modes**
- **Simulation Mode:** animates the car along the route, updating:
  - Battery SOC (%)
  - Distance remaining
  - ETA
  - Motor power (kW)
  - Energy needed to reach destination
  - Projected battery remaining upon arrival
- **GPS Mode:** uses your phone or laptop’s **real-time location** to update the same metrics live.

✅ **Dynamic Dashboard**
- Live map with moving vehicle marker.
- Right-side route analyzer panel.
- Left toolbar for simulation control.
- Battery card showing:
  - SOC %
  - Motor power (kW)
  - Needed kWh to destination
  - Projected SOC after arrival
  - Drive & Aux energy split
  - Remaining distance and ETA

✅ **Offline-Ready Demo**
- All logic runs client-side.
- Works offline after initial load (uses cached map tiles).

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React 18 + Vite |
| **Mapping** | Leaflet + react-leaflet |
| **Routing** | OSRM (public endpoint) |
| **Geocoding** | Nominatim (OpenStreetMap) |
| **Charts & UI** | Custom CSS / Tailwind optional |
| **Energy Engine** | Custom heuristic model (in `/src/utils/energyCalc.js`) |
| **Live Location** | `navigator.geolocation.watchPosition()` (GPS) |

---

## 🗂️ Folder Structure

```
POWERMAP/
├── client/
│ ├── node_modules/
│ └── src/
│ ├── components/
│ │ ├── panels/
│ │ │ ├── CompareRoutes.jsx
│ │ │ ├── OfflineModePanel.jsx
│ │ │ ├── PowerControlsPanel.jsx
│ │ │ ├── SimulationPanel.jsx
│ │ ├── BatteryStats.jsx
│ │ ├── FloatingToolbar.jsx
│ │ └── MapView.jsx
│ │
│ ├── demo/
│ │ └── demoRoute.js
│ │
│ ├── hooks/
│ │ └── useRouteSimulator.js
│ │
│ ├── styles/
│ │ └── globals.css
│ │
│ ├── utils/
│ │ ├── energyCalc.js
│ │ └── routeSimData.js
│ │
│ ├── App.jsx
│ ├── clientHelpers.js
│ ├── main.jsx
│ └── index.html
│
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── vite.config.js
```

---

## ⚙️ Setup Instructions

### 1️⃣ Requirements

- [Node.js](https://nodejs.org) (v18 or newer)
- npm (comes with Node)
- Git (for cloning)
- Optional: [GitHub CLI](https://cli.github.com/) (`gh`) for one-command repo creation

---

### 2️⃣ Installation

```bash
# Clone this repository
git clone https://github.com/<your-username>/PowerMap.git

# Go into the client folder
cd PowerMap/client

# Install dependencies
npm install
```

---

### 3️⃣ Run the App

```bash
# Start development server
npm run dev
```

Then open your browser at:

👉 **http://localhost:5173**

---

### 4️⃣ Run on Phone (for GPS mode)

To test on your mobile device:

```bash
npm run dev -- --host
```

Then visit **http://YOUR_COMPUTER_IP:5173** on your phone  
and allow **location access** in the browser.

> 📱 Example: `http://192.168.1.5:5173`

---

## 💡 Usage Guide

1. **Enter Origin & Destination**
   - Example: `Kanpur Bus Stand` → `Prayagraj Railway Station`
   - Wait for route alternatives to load.

2. **Analyze & Select a Route**
   - Each route shows predicted **kWh usage**.
   - Select the one with lowest energy.

3. **Set Auxiliary Loads**
   - Turn on/off AC, headlights, fog lamps, etc.
   - Energy model updates instantly.

4. **Start Simulation**
   - Vehicle moves along the route on map.
   - Dashboard updates every 0.5s with live:
     - Motor Power (kW)
     - Needed kWh to destination
     - Projected battery remaining (%)
     - Distance / ETA

5. **Try GPS Mode**
   - Runs with your live location.
   - SOC, ETA, and projections adjust dynamically as you move.

---

## 📊 Energy Model Overview

| Variable | Description |
|-----------|--------------|
| `baseKwhPerKm` | Base consumption rate (0.18 kWh/km) |
| `slopePenalty` | Additional usage per elevation gain |
| `trafficPenalty` | Multiplier for heavy/moderate traffic |
| `tempPenalty` | Adjusts for HVAC impact in hot/cold |
| `auxPowerKw` | AC, lights, and other auxiliary loads |
| `motorPowerKw` | Instantaneous drivetrain demand |
| `totalKwh` | Total energy estimated for route |

> ⚙️ Code: [`/src/utils/energyCalc.js`](./client/src/utils/energyCalc.js)

---

## 🧩 APIs Used

| API | Purpose |
|------|----------|
| **Nominatim** | Geocoding (search → lat/lon) |
| **OSRM** | Routing engine (polyline & ETA) |
| **Leaflet** | Map visualization |
| **Browser GPS API** | Real-time location tracking |

---

## 🖥️ Build for Production

```bash
cd client
npm run build
```

Then deploy the generated `/dist` folder to any static host such as:
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- GitHub Pages
- AWS S3 or CloudFront

---

## 🧪 Example Demo Flow

1. Search `Kanpur Bus Stand` → `Prayagraj Railway Station`.
2. Select “Power-optimized route”.
3. Turn on **AC** and **headlights**.
4. Start **simulation**:
   - Motor power fluctuates 10–25 kW.
   - Needed energy decreases over time.
   - SOC drops live (e.g. 85% → 81%).
5. Stop simulation → view summary.

---

## 🚀 Future Enhancements

- 🔋 Regen braking energy recovery model  
- 📡 Fleet dashboard with multiple vehicles  
- 🧭 Smart charger recommendation  
- 🏙️ Integration with Smart City open-data APIs  
- 🌤️ Weather-based predictive routing

---

## 🧰 Troubleshooting

**White screen / map not loading?**  
→ Check console (`Ctrl+Shift+I`) for missing import paths or version mismatches.

**OSRM errors / “Too Many Requests”?**  
→ The public OSRM/Nominatim endpoints have rate limits; switch to OpenRouteService or Mapbox APIs for production.

**GPS not updating?**  
→ Ensure browser permission is granted and HTTPS is used (or `localhost`).

---
#**Live Project Link** : 


Developed for **Volkswagen iMobilothon** by 🚗 *Team PowerMap*  
*(An OpenAI-assisted project prototype.)*
