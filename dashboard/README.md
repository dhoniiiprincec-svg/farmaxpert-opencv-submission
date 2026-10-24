# FarmXpert – Smart Farming Dashboard 🌾

A professional, high-resolution, modern web dashboard for an AI-powered precision agriculture system built on the core UX principle:
**SENSE → ANALYZE → PREDICT → RECOMMEND → ALERT**

---

## 🌟 Key Features

1. **Top Priority Decision Cards**:
   - **Plant Nutrition Status**: Nitrogen Deficient detection in Zone 2 & Zone 4 with direct advisory.
   - **Disease Detection & Risk**: High Risk Leaf Blight detection with 72% severity index and treatment plan.
   - **Irrigation Recommendation**: Automated water deficit calculations (18 mm needed today evening).

2. **Interactive Field & Zone Map**:
   - Realistic top-down 4-zone field visualization (Zone 1: Healthy, Zone 2: High Risk, Zone 3: Healthy, Zone 4: Irrigation Needed).
   - Clickable zones with deep-dive telemetry inspectors.
   - Toggleable NDVI / Health mode.

3. **Telemetry & Sensors**:
   - **Environmental Conditions**: Dynamic Temperature (32.5°C), Humidity (78%), Light (650 lux), Wind (12 km/h).
   - **Soil Condition**: Root-zone Moisture (32%), pH (6.8), Electrical Conductivity (1.2 dS/m), Soil Health (Good).
   - **Crop Health Gauge**: Circular SVG animated health meter (68 / 100 MODERATE) with Growth, Foliage, and Stress breakdown.

4. **Actionable AI Recommendations & Early Alerts**:
   - Priority-ranked field operations (fungicide spraying, drip irrigation, nitrogen fertigation).
   - Interactive modals for smart valve triggers and treatment logging.

5. **Farm Health Trend**:
   - Responsive multi-line trend chart (Overall Health, Disease Risk, Soil Moisture) with 24H / 7D / 30D toggles and hover tooltips.

6. **Quick Summary**:
   - Total Plants (5,420), Healthy Plants (76%), Diseased Plants (12%), Water Used Today (1,250 L), Estimated Yield (2.8 Tons/acre).

---

## 🚀 Running the Dashboard

### 1. Launch Frontend
Simply open `index.html` in any web browser, or serve using Python / Node:

```bash
# Using Python
python -m http.server 3000

# Open in browser:
# http://localhost:3000
```

### 2. (Optional) Run Local FastAPI Edge-AI Backend
The dashboard comes with an integrated FastAPI server designed for your VS Code Edge-AI module:

```bash
cd backend
pip install -r requirements.txt
python edge_ai_server.py
```

Swagger API documentation will be available at `http://localhost:8000/docs`.

---

## 🔌 Architecture & API Integration Layer

```
VS Code Edge AI (Python) 
         ↓
  Decision Engine 
         ↓
FastAPI / REST API (http://localhost:8000/api/v1)
         ↓
       JSON 
         ↓
FarmXpert Dashboard (apiService.js)
```

The frontend includes a centralized `js/apiService.js` with configurable `API_BASE_URL` and resilient offline fallback:
- **Offline / Demo Mode**: Uses local real-time simulator with subtle natural telemetry fluctuations.
- **Online Mode**: Directly fetches and renders live inference from your FastAPI backend.
