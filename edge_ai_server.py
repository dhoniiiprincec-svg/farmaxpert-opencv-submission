"""FarmXpert - FastAPI backend with real YOLO image inference."""
from pathlib import Path
from typing import List, Optional
import io
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from PIL import Image
from ultralytics import YOLO
from transformers import pipeline

ROOT = Path(__file__).resolve().parent
DASHBOARD_DIR = ROOT / "dashboard"
# ============================================================
# YOLO MODELS
# ============================================================


MODELS_DIR = ROOT / "models"

TOMATO_MODEL_PATH = MODELS_DIR / "tomato_best.pt"
MAIZE_MODEL_PATH = MODELS_DIR / "maize_best.pt"


print(f"🍅 Loading Tomato YOLO model: {TOMATO_MODEL_PATH}")

if not TOMATO_MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Tomato model not found at {TOMATO_MODEL_PATH}"
    )

tomato_model = YOLO(str(TOMATO_MODEL_PATH))
# --------------------------------------------------------
# PLANT IMAGE VALIDATION MODEL
# --------------------------------------------------------
print("🌿 Loading plant image validation model...")

plant_classifier = pipeline(
    "image-classification",
    model="blambert/ne_plant_classes_vit",
    device=-1
)

print("🌿 Plant image validation model loaded")


def check_plant_image(image_bgr):
    """
    Use a pretrained image classifier to screen unrelated images.
    This is a first-stage filter, not a dedicated leaf detector.
    """
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(image_rgb)

    predictions = plant_classifier(pil_image)
    top_prediction = predictions[0]

    label = top_prediction["label"].lower()
    confidence = float(top_prediction["score"])

    # Accept nature images only when the prediction is sufficiently confident.
    likely_plant = label == "nature" and confidence >= 0.70

    return {
        "likely_plant": likely_plant,
        "classifier_label": label,
        "classifier_confidence": round(confidence, 4),
        "method": "pretrained_image_classifier",
        "warning": (
            "Nature classification does not confirm that the image "
            "contains a tomato or maize leaf."
        )
    }



print(f"🍅 Tomato classes: {tomato_model.names}")


print(f"🌽 Loading Maize YOLO model: {MAIZE_MODEL_PATH}")

if not MAIZE_MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Maize model not found at {MAIZE_MODEL_PATH}"
    )

maize_model = YOLO(str(MAIZE_MODEL_PATH))

print(f"🌽 Maize classes: {maize_model.names}")

app = FastAPI(title="FarmXpert Edge-AI API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


class SensorTelemetryInput(BaseModel):
    temperature: float = Field(32.5)
    humidity: float = Field(78.0)
    soil_moisture: float = Field(32.0)
    light_intensity: float = Field(650.0)
    soil_ph: Optional[float] = Field(6.8)
    zone_id: Optional[str] = Field("z2")

FARM_STATE = {
    "farm_info": {"farm_id":"farm-001","farm_name":"Green Valley Farm","farmer_name":"Arjun","farmer_role":"Farmer","total_area":"12.5 Acres","crops":["Tomato","Chilli","Brinjal"],"weather":{"temperature":32,"condition":"Partly Cloudy","icon":"cloud-sun"}},
    "top_priorities": {"nutrition":{"status":"MODERATE","primary_deficiency":"Nitrogen Deficient","description":"N Deficiency detected in","affected_zones":["Zone 2","Zone 4"]},"disease":{"status":"HIGH RISK","disease_name":"Leaf Blight Detected","severity":72,"affected_zones":["Zone 2","Zone 4"]},"irrigation":{"status":"IRRIGATION REQUIRED","affected_zones":["Zone 2","Zone 4"],"next_irrigation":"Today Evening","water_need":"18 mm"}},
    "zones": [
        {"zone_id":"z1","zone_name":"Zone 1","sector":"North Sector","crop":"Tomato","variety":"Arka Rakshak","area":"3.2 Acres","status_label":"Healthy","status_type":"healthy","plant_health":92,"soil_moisture":46,"temperature":31.5,"humidity":74,"light_intensity":680,"nutrition_status":"OPTIMAL","nutrient_deficiency":"None","disease_detected":False,"disease_name":"None","disease_risk":"LOW","disease_severity":0,"irrigation_required":False,"irrigation_priority":"Normal","overall_risk":"LOW","recommendation":"Soil moisture and foliage are healthy."},
        {"zone_id":"z2","zone_name":"Zone 2","sector":"East Sector","crop":"Chilli","variety":"Guntur Sannam","area":"3.1 Acres","status_label":"High Risk","status_type":"risk","plant_health":46,"soil_moisture":32,"temperature":33.4,"humidity":82,"light_intensity":640,"nutrition_status":"DEFICIENT","nutrient_deficiency":"Nitrogen","disease_detected":True,"disease_name":"Leaf Blight","disease_risk":"HIGH","disease_severity":72,"irrigation_required":True,"irrigation_priority":"High","overall_risk":"HIGH","recommendation":"Inspect affected plants and manage irrigation."},
        {"zone_id":"z3","zone_name":"Zone 3","sector":"South Sector","crop":"Tomato","variety":"Vaibhav Hybrid","area":"3.4 Acres","status_label":"Healthy","status_type":"healthy","plant_health":89,"soil_moisture":44,"temperature":31.8,"humidity":76,"light_intensity":660,"nutrition_status":"OPTIMAL","nutrient_deficiency":"None","disease_detected":False,"disease_name":"None","disease_risk":"LOW","disease_severity":0,"irrigation_required":False,"irrigation_priority":"Normal","overall_risk":"LOW","recommendation":"Crop growth on track."},
        {"zone_id":"z4","zone_name":"Zone 4","sector":"West Sector","crop":"Brinjal","variety":"Pusa Purple Long","area":"2.8 Acres","status_label":"Irrigation Needed","status_type":"attention","plant_health":64,"soil_moisture":24,"temperature":33.1,"humidity":72,"light_intensity":670,"nutrition_status":"MODERATE","nutrient_deficiency":"Nitrogen & Potassium","disease_detected":False,"disease_name":"None","disease_risk":"MODERATE","disease_severity":18,"irrigation_required":True,"irrigation_priority":"Urgent (Evening)","overall_risk":"ATTENTION","recommendation":"Soil moisture is low. Irrigate today evening."}
    ],
    "environmental":{"temperature":32.5,"humidity":78,"light_intensity":650,"wind_speed":12},
    "soil":{"soil_moisture":32,"soil_ph":6.8,"electrical_conductivity":1.2,"soil_health":"Good"},
    "plant_health_score":{"overall_score":68,"max_score":100,"status":"MODERATE","sub_metrics":{"growth_rate":{"label":"Growth Rate","status":"Good","value":82},"leaf_health":{"label":"Leaf Health","status":"Moderate","value":65},"stress_level":{"label":"Stress Level","status":"Moderate","value":60}}},
    "alerts":[{"id":"alt-001","title":"Live Disease Detection","description":"Latest phone-camera AI result.","status":"Monitoring","type":"danger","time":"Live","zone":"Camera","action":"Inspect"}],
    "ai_recommendations":[{"id":"rec-1","number":1,"text":"Use the live camera to inspect affected leaves."},{"id":"rec-2","number":2,"text":"Verify AI detections visually before treatment."}],
    "historical_trends":{"7days":{"labels":["Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Today"],"overall_health":[82,80,78,74,71,69,68],"disease_risk":[15,18,25,42,58,68,72],"soil_moisture":[52,48,45,39,36,34,32]},"24hours":{"labels":["00:00","04:00","08:00","12:00","16:00","20:00","Now"],"overall_health":[70,70,69,68,68,68,68],"disease_risk":[65,66,68,70,72,72,72],"soil_moisture":[38,37,35,33,32,32,32]},"30days":{"labels":["Week 1","Week 2","Week 3","Week 4","Current"],"overall_health":[88,85,80,72,68],"disease_risk":[10,15,30,55,72],"soil_moisture":[58,52,46,38,32]}},
    "quick_summary":{"total_plants":"5,420","healthy_plants":"76%","diseased_plants":"12%","water_used_today":"1,250 L","estimated_yield":"2.8 Tons/acre"}
}

@app.get("/api/v1/health")
def health_check(): return {"status":"healthy","service":"FarmXpert Edge-AI Engine","version":"2.0.0","model":"FarmXpert Tomato YOLO"}
@app.get("/api/v1/farm/overview")
def farm_overview(): return FARM_STATE
@app.get("/api/v1/zones/{zone_id}")
def zone(zone_id:str):
    for z in FARM_STATE["zones"]:
        if z["zone_id"] == zone_id or z["zone_name"].lower() == zone_id.lower(): return z
    raise HTTPException(404,"Zone not found")
@app.get("/api/v1/sensors/telemetry")
def telemetry(): return {"environmental":FARM_STATE["environmental"],"soil":FARM_STATE["soil"]}
@app.get("/api/v1/plant-health")
def plant_health(): return FARM_STATE["plant_health_score"]
@app.get("/api/v1/nutrition/status")
def nutrition(): return FARM_STATE["top_priorities"]["nutrition"]
@app.get("/api/v1/disease/risk")
def disease_risk(): return FARM_STATE["top_priorities"]["disease"]
@app.get("/api/v1/irrigation/recommendation")
def irrigation(): return FARM_STATE["top_priorities"]["irrigation"]
@app.get("/api/v1/alerts")
def alerts(): return FARM_STATE["alerts"]
@app.get("/api/v1/recommendations")
def recommendations(): return FARM_STATE["ai_recommendations"]
@app.get("/api/v1/trends")
def trends(range:str="7days"): return FARM_STATE["historical_trends"].get(range,FARM_STATE["historical_trends"]["7days"])

@app.post("/api/v1/inference/predict")
def inference_predict(telemetry: SensorTelemetryInput):
    irrigation_required = telemetry.soil_moisture < 35
    disease_risk = "HIGH" if telemetry.humidity > 75 and telemetry.temperature > 30 else "LOW"
    return {"temperature":telemetry.temperature,"humidity":telemetry.humidity,"soil_moisture":telemetry.soil_moisture,"light_intensity":telemetry.light_intensity,"nutrition_status":"MODERATE","nutrient_deficiency":"Nitrogen","disease_detected":disease_risk=="HIGH","disease_name":"Leaf Blight" if disease_risk=="HIGH" else "None","disease_risk":disease_risk,"disease_severity":72 if disease_risk=="HIGH" else 12,"irrigation_required":irrigation_required,"irrigation_zones":["Zone 2","Zone 4"] if irrigation_required else [],"overall_risk":"HIGH" if disease_risk=="HIGH" else ("ATTENTION" if irrigation_required else "LOW"),"recommendation":"Irrigation required" if irrigation_required else "Maintain standard fertigation"}

@app.post("/api/v1/inference/image")
async def inference_image(
    file: UploadFile = File(...),
    crop: str = "tomato"
):
    """
    Run YOLO inference using the selected crop model.

    crop=tomato -> Tomato YOLO
    crop=maize  -> Maize YOLO
    """

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file"
        )

    # --------------------------------------------------------
    # Select model
    # --------------------------------------------------------

    crop = crop.lower().strip()

    if crop == "maize":
        selected_model = maize_model
        model_name = "FarmXpert Maize YOLO"
    elif crop == "tomato":
        selected_model = tomato_model
        model_name = "FarmXpert Tomato YOLO"
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid crop. Use 'tomato' or 'maize'."
        )

    
    # --------------------------------------------------------
    # Read image and process with OpenCV 5
    # --------------------------------------------------------

    raw = await file.read()

    try:
        # Decode uploaded image using OpenCV
        image_array = np.frombuffer(raw, dtype=np.uint8)
        image_bgr = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )

        if image_bgr is None:
            raise ValueError("Could not decode image")

        # Record original image dimensions
        original_height, original_width = image_bgr.shape[:2]

        # Basic image-quality measurements
        gray = cv2.cvtColor(
            image_bgr,
            cv2.COLOR_BGR2GRAY
        )

        brightness = float(np.mean(gray))

        sharpness = float(
            cv2.Laplacian(
                gray,
                cv2.CV_64F
            ).var()
        )
        
        # --------------------------------------------------------
        # OpenCV image-quality assessment (initial thresholds)
        # --------------------------------------------------------

        quality_warnings = []

        if brightness < 50:
            quality_warnings.append(
                "Image is too dark. Capture the leaf in better lighting."
            )
        elif brightness > 210:
            quality_warnings.append(
                "Image may be overexposed. Avoid direct harsh sunlight."
            )

        if sharpness < 50:
            quality_warnings.append(
                "Image may be blurry. Hold the camera steady and retake it."
            )

        image_quality = (
            "RETAKE_RECOMMENDED"
            if quality_warnings
            else "ACCEPTABLE"
        )
        
        


        # Convert BGR to RGB for the existing YOLO model
        image_rgb = cv2.cvtColor(
            image_bgr,
            cv2.COLOR_BGR2RGB
        )

        # Preserve the PIL image input format used by your model
        image = Image.fromarray(image_rgb)

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image: {exc}"
        )
    
    # --------------------------------------------------------
    # AGENTIC DECISION: CHECK IMAGE QUALITY BEFORE YOLO
    # --------------------------------------------------------
    if quality_warnings:
        # AGENT WORKFLOW TRACE: image quality failure
        agent_trace = {
            "perception": {
                "opencv_version": cv2.__version__,
                "brightness": round(brightness, 2),
                "sharpness": round(sharpness, 2),
                "image_quality": image_quality,
                "quality_warnings": quality_warnings
            },
            "model_assessment": "SKIPPED",
            "decision": "REQUEST_CLEARER_IMAGE",
            "action": "Ask the user to capture a clearer image",
            "human_review_required": True
        }

        print("[FARMAXPERT AGENT TRACE] " + str(agent_trace))
        return {
            "success": True,
            "crop": crop,
            "model": model_name,
            "image": file.filename,
            "needs_retake": True,
            "disease_detected": False,
            "disease_name": "Not assessed",
            "confidence": 0.0,
            "risk": "UNKNOWN",
            "detections": [],
            "opencv": {
                "version": cv2.__version__,
                "image_width": original_width,
                "image_height": original_height,
                "brightness": round(brightness, 2),
                "sharpness": round(sharpness, 2),
                "image_quality": image_quality,
                "quality_warnings": quality_warnings,
                "quality_check": "brightness_and_laplacian_sharpness"
            },
            "agent_decision": "REQUEST_CLEARER_IMAGE",
            "recommendation": (
                "Disease analysis was skipped because image quality "
                "needs improvement. Please capture a clearer image "
                "with suitable lighting."
            )
        }
            
    
   
    # --------------------------------------------------------
    # BASIC PLANT-IMAGE SCREENING
    # --------------------------------------------------------

    plant_check = check_plant_image(image_bgr)

    if not plant_check["likely_plant"]:
        agent_trace = {
            "perception": {
                "opencv_version": cv2.__version__,
                "image_quality": image_quality,
                "plant_check": plant_check
            },
            "model_assessment": "SKIPPED",
            "decision": "REQUEST_PLANT_IMAGE",
            "action": "Ask the user to upload a clear plant or leaf image",
            "human_review_required": False
        }

        print("[FARMAXPERT AGENT TRACE] " + str(agent_trace))

        return {
            "success": True,
            "crop": crop,
            "model": model_name,
            "image": file.filename,
            "plant_detected": False,
            "disease_detected": False,
            "disease_name": "Not assessed",
            "confidence": 0.0,
            "risk": "UNKNOWN",
            "detections": [],
            "needs_retake": False,
            "agent_decision": "REQUEST_PLANT_IMAGE",
            "human_review_required": False,
            "opencv": {
                "version": cv2.__version__,
                "image_width": original_width,
                "image_height": original_height,
                "brightness": round(brightness, 2),
                "sharpness": round(sharpness, 2),
                "image_quality": image_quality,
                "plant_check": plant_check
            },
            "recommendation": (
                "Plant or leaf not detected by the initial screening. "
                "Please upload a clear crop-leaf image. "
                "This screening is not definitive."
            )
        }
    # --------------------------------------------------------
    # YOLO inference
    # --------------------------------------------------------
    results = selected_model.predict(
        source=image,
        conf=0.20,
        verbose=False
    )

    detections = []

    for result in results:

        if result.boxes is None:
            continue

        for box in result.boxes:

            cls_id = int(box.cls.item())
            conf = float(box.conf.item())

            if isinstance(selected_model.names, dict):
                name = selected_model.names.get(
                    cls_id,
                    str(cls_id)
                )
            else:
                name = selected_model.names[cls_id]

            detections.append({
                "class_id": cls_id,
                "class_name": name,
                "confidence": round(conf, 4)
            })

    # Highest confidence first
    detections.sort(
        key=lambda x: x["confidence"],
        reverse=True
    )

    # --------------------------------------------------------
    # Determine top detection
    # --------------------------------------------------------

    top = detections[0] if detections else None

    confidence = (
        top["confidence"]
        if top
        else 0.0
    )

    if top:
        detected_name = top["class_name"]
    else:
        detected_name = "Healthy"

    # --------------------------------------------------------
    # Healthy detection handling
    # --------------------------------------------------------

    disease_detected = (
        top is not None
        and str(detected_name).lower() != "healthy"
    )

    # --------------------------------------------------------
    # Demo risk mapping
    # --------------------------------------------------------

    risk = (
        "HIGH"
        if confidence >= 0.70
        else
        "MODERATE"
        if confidence >= 0.45
        else
        "LOW"
    )
    
    # --------------------------------------------------------
    # AGENTIC DECISION: DISEASE RESPONSE
    # --------------------------------------------------------

    agent_decision = "CONTINUE_MONITORING"
    human_review_required = False

    if not detections:
        recommendation = (
            "No disease detected by the model in this image. "
            "Continue monitoring and inspect again if symptoms appear."
        )
        agent_decision = "CONTINUE_MONITORING"

    elif confidence < 0.45:
        recommendation = (
            f"The model's prediction ({detected_name}) has low confidence "
            f"({confidence * 100:.1f}%). Capture another clear image "
            "from a different angle or request human review before acting."
        )
        agent_decision = "REQUEST_SECOND_IMAGE"
        human_review_required = True

    elif disease_detected:
        recommendation = (
            f"The model detected {detected_name} with "
            f"{confidence * 100:.1f}% confidence. Inspect nearby plants "
            "and request human confirmation before treatment."
        )
        agent_decision = "INSPECT_AFFECTED_PLANTS"
        human_review_required = True

    else:
        recommendation = (
            "The model did not identify a disease in this image. "
            "Continue monitoring and seek expert review if symptoms persist."
        )
        agent_decision = "CONTINUE_MONITORING"

    
    # --------------------------------------------------------
    # Update dashboard live state
    # --------------------------------------------------------

    FARM_STATE["top_priorities"]["disease"] = {
        "status": f"{risk} RISK",
        "disease_name": detected_name,
        "severity": round(confidence * 100),
        "affected_zones": ["Live Camera"]
    }

    FARM_STATE["alerts"][0] = {
        "id": "alt-live",

        "title": (
            f"{detected_name} detected by live camera"
        ),

        "description": recommendation,

        "status": f"{risk} Risk",

        "type": (
            "danger"
            if disease_detected
            else "success"
        ),

        "time": "Live",

        "zone": (
            f"Phone Camera - {crop.title()}"
        ),

        "action": "Inspect"
    }
    
    # --------------------------------------------------------
    # AGENT WORKFLOW TRACE
    # Records perception -> decision -> action
    # --------------------------------------------------------

    agent_trace = {
        "perception": {
            "opencv_version": cv2.__version__,
            "brightness": round(brightness, 2),
            "sharpness": round(sharpness, 2),
            "image_quality": image_quality,
            "quality_warnings": quality_warnings
        },
        "model_assessment": {
            "disease_name": detected_name,
            "confidence": round(confidence, 4),
            "risk": risk
        },
        "decision": agent_decision,
        "action": recommendation,
        "human_review_required": human_review_required
    }

    print(
        "[FARMAXPERT AGENT TRACE] "
        + str(agent_trace)
    )
    # --------------------------------------------------------
    # API response
    # --------------------------------------------------------

    return {
        "success": True,

        "crop": crop,

        "model": model_name,

        "image": file.filename,

        "disease_detected": disease_detected,

        "disease_name": detected_name,

        "confidence": round(
            confidence,
            4
        ),

        "risk": risk,
        "agent_decision": agent_decision,
        "human_review_required": human_review_required,
        "detections": detections,
        
        "opencv": {
            "version": cv2.__version__,
            "image_width": original_width,
            "image_height": original_height,
            "brightness": round(brightness, 2),
            "sharpness": round(sharpness, 2),
            "image_quality": image_quality,
            "quality_warnings": quality_warnings,
            "quality_check": "brightness_and_laplacian_sharpness"
        },

        "recommendation": recommendation
    }
app.mount("/", StaticFiles(directory=str(DASHBOARD_DIR), html=True), name="dashboard")

if __name__ == "__main__":
    import uvicorn
    print("🌾 FarmXpert integrated server: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
