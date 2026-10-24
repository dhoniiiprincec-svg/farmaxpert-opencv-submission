/**
 * FarmXpert - Centralized API & Edge-AI Service Layer
 * 
 * Architecture:
 * VS Code Edge AI (Python) -> FastAPI REST / WebSocket -> JSON -> apiService.js -> Dashboard UI
 * 
 * Supports:
 * - Real FastAPI backend connections at configurable API_BASE_URL
 * - Resilient offline fallback with graceful degradation
 * - Live real-time polling / simulation
 */

class FarmXpertApiService {
  constructor() {
    this.API_BASE_URL = localStorage.getItem('farmxpert_api_url') || 'http://localhost:8000/api/v1';
    this.isConnected = false;
    this.isLiveSimulating = true;
    this.currentData = JSON.parse(JSON.stringify(window.FARMXPERT_DEFAULT_DATA || {}));
    this.pollingInterval = null;
    this.pollDurationMs = 6000; // 6s polling
    this.listeners = [];
  }

  /**
   * Subscribe to data or status updates
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('Notification error in subscriber:', err);
      }
    });
  }

  /**
   * Update API Base URL
   */
  setApiBaseUrl(url) {
    this.API_BASE_URL = url.trim().replace(/\/+$/, '');
    localStorage.setItem('farmxpert_api_url', this.API_BASE_URL);
    return this.testConnection();
  }

  getApiBaseUrl() {
    return this.API_BASE_URL;
  }

  /**
   * Test FastAPI backend health
   */
  async testConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${this.API_BASE_URL}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.isConnected = true;
        this.notify('connection_change', { connected: true, url: this.API_BASE_URL });
        return { success: true, message: 'Connected to Edge-AI FastAPI backend successfully' };
      } else {
        throw new Error(`HTTP Status ${res.status}`);
      }
    } catch (err) {
      this.isConnected = false;
      this.notify('connection_change', { connected: false, error: err.message });
      return { 
        success: false, 
        message: 'Edge-AI connection unavailable — displaying latest available data' 
      };
    }
  }

  /**
   * Fetch complete farm overview
   */
  async getFarmOverview() {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/farm/overview`);
        if (res.ok) {
          const data = await res.json();
          this.currentData = this.mergeApiResponse(data);
          this.notify('data_updated', this.currentData);
          return this.currentData;
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to local dataset:', err);
        this.isConnected = false;
        this.notify('connection_change', { connected: false, error: err.message });
      }
    }
    // Return local data with optional simulation jitter
    if (this.isLiveSimulating) {
      this.applySimulationJitter();
    }
    return this.currentData;
  }

  /**
   * Fetch specific Zone details
   */
  async getZoneData(zoneId) {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/zones/${zoneId}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Zone API fetch error:', e);
      }
    }
    return this.currentData.zones.find(z => z.zone_id === zoneId || z.zone_name.toLowerCase() === zoneId.toLowerCase()) || this.currentData.zones[0];
  }

  /**
   * Fetch Environmental & Soil Sensor Telemetry
   */
  async getSensorData() {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/sensors/telemetry`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Sensor API fetch error:', e);
      }
    }
    return {
      environmental: this.currentData.environmental,
      soil: this.currentData.soil
    };
  }

  /**
   * Fetch Plant Health Score
   */
  async getPlantHealth() {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/plant-health`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Plant health API error:', e);
      }
    }
    return this.currentData.plant_health_score;
  }

  /**
   * Fetch Plant Nutrition Status
   */
  async getNutritionStatus() {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/nutrition/status`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Nutrition API error:', e);
      }
    }
    return this.currentData.top_priorities.nutrition;
  }

  /**
   * Fetch Disease Detection & Risk
   */
  async getDiseaseRisk() {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/disease/risk`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Disease API error:', e);
      }
    }
    return this.currentData.top_priorities.disease;
  }

  /**
   * Fetch Irrigation Recommendations
   */
  async getIrrigationRecommendation() {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/irrigation/recommendation`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Irrigation API error:', e);
      }
    }
    return this.currentData.top_priorities.irrigation;
  }

  /**
   * Fetch Early Risk Alerts
   */
  async getAlerts() {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/alerts`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Alerts API error:', e);
      }
    }
    return this.currentData.alerts;
  }

  /**
   * Fetch AI Recommended Actions
   */
  async getRecommendations() {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/recommendations`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Recommendations API error:', e);
      }
    }
    return this.currentData.ai_recommendations;
  }

  /**
   * Fetch Historical Trends
   */
  async getHistoricalTrends(range = '7days') {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/trends?range=${range}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Trends API error:', e);
      }
    }
    return this.currentData.historical_trends[range] || this.currentData.historical_trends['7days'];
  }

  /**
   * Merge external JSON format into internal schema
   * Handles format specified in prompt:
   * { "temperature": 32.5, "humidity": 78, "soil_moisture": 42, ... }
   */
  mergeApiResponse(apiData) {
    if (!apiData) return this.currentData;

    const merged = JSON.parse(JSON.stringify(this.currentData));

    if (apiData.temperature !== undefined) merged.environmental.temperature = apiData.temperature;
    if (apiData.humidity !== undefined) merged.environmental.humidity = apiData.humidity;
    if (apiData.light_intensity !== undefined) merged.environmental.light_intensity = apiData.light_intensity;
    if (apiData.soil_moisture !== undefined) merged.soil.soil_moisture = apiData.soil_moisture;

    if (apiData.nutrition_status) merged.top_priorities.nutrition.status = apiData.nutrition_status;
    if (apiData.nutrient_deficiency) {
      merged.top_priorities.nutrition.primary_deficiency = `${apiData.nutrient_deficiency} Deficient`;
    }

    if (apiData.disease_detected !== undefined) {
      merged.top_priorities.disease.disease_name = apiData.disease_name || 'Leaf Blight Detected';
      merged.top_priorities.disease.status = apiData.disease_risk ? `${apiData.disease_risk} RISK` : 'HIGH RISK';
      merged.top_priorities.disease.severity = apiData.disease_severity || 72;
    }

    if (apiData.irrigation_required !== undefined) {
      merged.top_priorities.irrigation.status = apiData.irrigation_required ? 'IRRIGATION REQUIRED' : 'OPTIMAL MOISTURE';
      if (apiData.irrigation_zones) merged.top_priorities.irrigation.affected_zones = apiData.irrigation_zones;
    }

    return merged;
  }

  /**
   * Applies realistic subtle agronomic telemetry jitter for live visualization
   */
  applySimulationJitter() {
    const jitter = (val, maxDelta, decimals = 1) => {
      const delta = (Math.random() * 2 - 1) * maxDelta;
      return parseFloat((val + delta).toFixed(decimals));
    };

    // Environmental subtle fluctuation
    this.currentData.environmental.temperature = jitter(32.5, 0.4, 1);
    this.currentData.environmental.humidity = Math.min(95, Math.max(50, Math.round(jitter(78, 1.2, 0))));
    this.currentData.environmental.light_intensity = Math.round(jitter(650, 15, 0));
    this.currentData.environmental.wind_speed = Math.round(jitter(12, 1, 0));

    // Soil subtle fluctuation
    this.currentData.soil.soil_moisture = Math.round(jitter(32, 0.6, 0));
    this.currentData.soil.soil_ph = jitter(6.8, 0.05, 1);
    this.currentData.soil.electrical_conductivity = jitter(1.2, 0.03, 2);
  }

  /**
   * Start live background polling
   */
  startPolling(onTick) {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.pollingInterval = setInterval(async () => {
      const updated = await this.getFarmOverview();
      if (onTick) onTick(updated);
    }, this.pollDurationMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}

window.apiService = new FarmXpertApiService();
