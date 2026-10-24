/**
 * FarmXpert - Default Agronomy Mock Dataset
 * Formatted for immediate use and matching the Edge-AI REST API schema.
 */

const FARMXPERT_DEFAULT_DATA = {
  farm_info: {
    farm_id: "farm-001",
    farm_name: "Green Valley Farm",
    farmer_name: "Arjun",
    farmer_role: "Farmer",
    total_area: "12.5 Acres",
    crops: ["Tomato", "Chilli", "Brinjal"],
    weather: {
      temperature: 32,
      condition: "Partly Cloudy",
      icon: "cloud-sun"
    }
  },

  top_priorities: {
    nutrition: {
      status: "MODERATE",
      primary_deficiency: "Nitrogen Deficient",
      description: "N Deficiency detected in",
      affected_zones: ["Zone 2", "Zone 4"],
      details: {
        chlorosis_index: "Moderate yellowing on lower leaves",
        recommended_fertilizer: "Urea (46-0-0) or Calcium Nitrate",
        application_rate: "15 kg/acre via fertigation"
      }
    },
    disease: {
      status: "HIGH RISK",
      disease_name: "Leaf Blight Detected",
      severity: 72,
      affected_zones: ["Zone 2", "Zone 4"],
      details: {
        pathogen: "Alternaria solani / Xanthomonas",
        spread_risk: "High due to 78% relative humidity",
        action_protocol: "Foliar spray with Copper Oxychloride or Mancozeb (2.5g/L)"
      }
    },
    irrigation: {
      status: "IRRIGATION REQUIRED",
      affected_zones: ["Zone 2", "Zone 4"],
      next_irrigation: "Today Evening",
      water_need: "18 mm",
      details: {
        soil_deficit: "16-20 mm below field capacity",
        irrigation_method: "Precision Drip (Flow rate: 2.2 L/h/emitter)",
        recommended_duration: "1 hour 45 minutes"
      }
    }
  },

  zones: [
    {
      zone_id: "z1",
      zone_name: "Zone 1",
      sector: "North Sector",
      crop: "Tomato",
      variety: "Arka Rakshak",
      area: "3.2 Acres",
      status_label: "Healthy",
      status_type: "healthy", // healthy | attention | risk
      plant_health: 92,
      soil_moisture: 46,
      temperature: 31.5,
      humidity: 74,
      light_intensity: 680,
      nutrition_status: "OPTIMAL",
      nutrient_deficiency: "None",
      disease_detected: false,
      disease_name: "None",
      disease_risk: "LOW",
      disease_severity: 0,
      irrigation_required: false,
      irrigation_priority: "Normal",
      overall_risk: "LOW",
      recommendation: "Soil moisture and foliage are healthy. Maintain current fertigation schedule."
    },
    {
      zone_id: "z2",
      zone_name: "Zone 2",
      sector: "East Sector",
      crop: "Chilli",
      variety: "Guntur Sannam",
      area: "3.1 Acres",
      status_label: "High Risk",
      status_type: "risk",
      plant_health: 46,
      soil_moisture: 32,
      temperature: 33.4,
      humidity: 82,
      light_intensity: 640,
      nutrition_status: "DEFICIENT",
      nutrient_deficiency: "Nitrogen",
      disease_detected: true,
      disease_name: "Leaf Blight",
      disease_risk: "HIGH",
      disease_severity: 72,
      irrigation_required: true,
      irrigation_priority: "High",
      overall_risk: "HIGH",
      recommendation: "High disease risk: Apply Copper fungicide immediately and schedule 18mm irrigation."
    },
    {
      zone_id: "z3",
      zone_name: "Zone 3",
      sector: "South Sector",
      crop: "Tomato",
      variety: "Vaibhav Hybrid",
      area: "3.4 Acres",
      status_label: "Healthy",
      status_type: "healthy",
      plant_health: 89,
      soil_moisture: 44,
      temperature: 31.8,
      humidity: 76,
      light_intensity: 660,
      nutrition_status: "OPTIMAL",
      nutrient_deficiency: "None",
      disease_detected: false,
      disease_name: "None",
      disease_risk: "LOW",
      disease_severity: 0,
      irrigation_required: false,
      irrigation_priority: "Normal",
      overall_risk: "LOW",
      recommendation: "Crop growth is on track. Next scheduled nutrition check in 3 days."
    },
    {
      zone_id: "z4",
      zone_name: "Zone 4",
      sector: "West Sector",
      crop: "Brinjal",
      variety: "Pusa Purple Long",
      area: "2.8 Acres",
      status_label: "Irrigation Needed",
      status_type: "attention",
      plant_health: 64,
      soil_moisture: 24,
      temperature: 33.1,
      humidity: 72,
      light_intensity: 670,
      nutrition_status: "MODERATE",
      nutrient_deficiency: "Nitrogen & Potassium",
      disease_detected: false,
      disease_name: "None",
      disease_risk: "MODERATE",
      disease_severity: 18,
      irrigation_required: true,
      irrigation_priority: "Urgent (Evening)",
      overall_risk: "ATTENTION",
      recommendation: "Soil moisture is low (24%). Irrigate 18 mm today evening."
    }
  ],

  environmental: {
    temperature: 32.5,
    temperature_unit: "°C",
    temperature_status: "Normal",
    humidity: 78,
    humidity_unit: "%",
    humidity_status: "High",
    light_intensity: 650,
    light_unit: "lux",
    light_status: "Optimal",
    wind_speed: 12,
    wind_unit: "km/h",
    wind_status: "Moderate Breeze"
  },

  soil: {
    soil_moisture: 32,
    soil_moisture_unit: "%",
    soil_moisture_status: "Low in 2 Zones",
    soil_ph: 6.8,
    soil_ph_unit: "pH",
    soil_ph_status: "Ideal (Neutral)",
    electrical_conductivity: 1.2,
    ec_unit: "dS/m",
    ec_status: "Optimal Salinity",
    soil_health: "Good",
    soil_health_rating: "Class A"
  },

  plant_health_score: {
    overall_score: 68,
    max_score: 100,
    status: "MODERATE",
    sub_metrics: {
      growth_rate: { label: "Growth Rate", status: "Good", value: 82 },
      leaf_health: { label: "Leaf Health", status: "Moderate", value: 65 },
      stress_level: { label: "Stress Level", status: "Moderate", value: 60 }
    }
  },

  alerts: [
    {
      id: "alt-001",
      title: "High Disease Risk in Zone 2",
      description: "Leaf Blight is spreading. Immediate action required.",
      status: "High Risk",
      type: "danger",
      time: "10 mins ago",
      zone: "Zone 2",
      action: "Inspect & Spray Fungicide"
    },
    {
      id: "alt-002",
      title: "Soil Moisture Low in Zone 4",
      description: "Soil moisture dropped below optimal level.",
      status: "Attention",
      type: "warning",
      time: "25 mins ago",
      zone: "Zone 4",
      action: "Trigger Drip Irrigation"
    },
    {
      id: "alt-003",
      title: "Nitrogen Depletion Warning",
      description: "Mild chlorosis pattern detected by edge camera in Zone 2.",
      status: "Attention",
      type: "warning",
      time: "1 hour ago",
      zone: "Zone 2",
      action: "Fertigation scheduled"
    }
  ],

  ai_recommendations: [
    {
      id: "rec-1",
      number: 1,
      text: "Irrigate Zone 2 and Zone 4 today evening.",
      priority: "high",
      target: "Zone 2, Zone 4",
      detail: "18mm water deficit detected. Optimal watering time is 5:30 PM."
    },
    {
      id: "rec-2",
      number: 2,
      text: "Apply nitrogen fertilizer in Zone 2.",
      priority: "medium",
      target: "Zone 2",
      detail: "Inject 15kg/acre Urea via drip fertigation tank."
    },
    {
      id: "rec-3",
      number: 3,
      text: "Inspect plants in Zone 2 for Leaf Blight.",
      priority: "high",
      target: "Zone 2",
      detail: "72% fungal probability. Apply Copper Oxychloride foliar spray."
    },
    {
      id: "rec-4",
      number: 4,
      text: "Maintain soil moisture between 30% – 60%.",
      priority: "normal",
      target: "All Zones",
      detail: "Continuous automated soil moisture sensing active across 4 nodes."
    }
  ],

  historical_trends: {
    "7days": {
      labels: ["Day 1 (Thu)", "Day 2 (Fri)", "Day 3 (Sat)", "Day 4 (Sun)", "Day 5 (Mon)", "Day 6 (Tue)", "Today (Wed)"],
      overall_health: [82, 80, 78, 74, 71, 69, 68],
      disease_risk: [15, 18, 25, 42, 58, 68, 72],
      soil_moisture: [52, 48, 45, 39, 36, 34, 32]
    },
    "24hours": {
      labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"],
      overall_health: [70, 70, 69, 68, 68, 68, 68],
      disease_risk: [65, 66, 68, 70, 72, 72, 72],
      soil_moisture: [38, 37, 35, 33, 32, 32, 32]
    },
    "30days": {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Current"],
      overall_health: [88, 85, 80, 72, 68],
      disease_risk: [10, 15, 30, 55, 72],
      soil_moisture: [58, 52, 46, 38, 32]
    }
  },

  quick_summary: {
    total_plants: "5,420",
    healthy_plants: "76%",
    diseased_plants: "12%",
    water_used_today: "1,250 L",
    estimated_yield: "2.8 Tons/acre"
  }
};

window.FARMXPERT_DEFAULT_DATA = FARMXPERT_DEFAULT_DATA;
