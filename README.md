# 🌾 FarmXpert — AI-Powered Agronomy & Crop Health Analysis

**An AI-assisted crop health monitoring system built with computer vision and deep learning.**

FarmXpert is designed to help users analyze crop images, identify potential plant diseases, evaluate image quality, and obtain structured results to support agricultural decision-making.

## 🚀 Live Demo

- **Dashboard:** https://d1p1tenqj0s2gy.cloudfront.net
- **Backend health endpoint:** https://zarfg6ldbqtjfhoffjiqddvxcm0mwuka.lambda-url.ap-southeast-2.on.aws/api/v1/health

The dashboard uses a cloud-hosted backend for image inference. Availability may depend on the deployment status and model initialization.

## 🎯 Project Objectives

- Apply computer vision to agricultural image analysis.
- Detect potential crop diseases using trained YOLO models.
- Evaluate image quality using OpenCV.
- Provide structured inference results and confidence scores.
- Support agricultural monitoring through a web dashboard and API.

## 🧠 Key Features

### 1. AI-Based Crop Analysis
Processes submitted crop images and returns prediction results when the required model and inference pipeline are available.

### 2. Multi-Crop Model Support
The backend includes trained YOLO models for:
- **Tomato:** Disease and plant-health categories.
- **Maize:** Disease and pest-related categories.

Predictions depend on the capabilities and training data of the selected model.

### 3. OpenCV Image-Quality Analysis
The image-processing pipeline includes:
- Image dimension extraction.
- Brightness measurement.
- Laplacian-based sharpness assessment.
- Image-quality warnings.

These measurements help assess whether an uploaded image may be suitable for analysis.

### 4. Structured AI Results
The inference API is designed to return information such as:
- Selected crop and model.
- Predicted disease or health category.
- Confidence score.
- Detected objects, where supported.
- Image-quality metrics.
- Risk assessment and recommendations.

### 5. Web Dashboard
A browser-based interface for accessing FarmXpert's agricultural monitoring and image-analysis functionality.

## 🛠️ Technology Stack

- **Computer Vision:** OpenCV
- **Object Detection:** Ultralytics YOLO
- **Deep Learning:** PyTorch
- **Image Processing:** Pillow and NumPy
- **API Framework:** FastAPI
- **API Gateway Adapter:** Mangum
- **Backend Deployment:** AWS Lambda container image
- **Container Registry and Build:** Amazon ECR and AWS CodeBuild
- **Dashboard Hosting:** Amazon CloudFront
- **Plant Image Validation:** Hugging Face Transformers

## 🏗️ System Architecture

1. The user opens the FarmXpert dashboard.
2. The user selects a crop and uploads an image.
3. The dashboard sends the image to the FastAPI inference endpoint.
4. The backend validates and processes the image.
5. OpenCV calculates image-quality measurements.
6. The appropriate trained model performs inference.
7. The API returns structured results for the dashboard to display.

## 🧪 Testing Instructions for Judges

### Test 1 — Backend Health Check
Open the backend health endpoint:

https://zarfg6ldbqtjfhoffjiqddvxcm0mwuka.lambda-url.ap-southeast-2.on.aws/api/v1/health

A successful response should return a healthy service status and backend information.

### Test 2 — Dashboard Access
Open:

https://d1p1tenqj0s2gy.cloudfront.net

Confirm that the dashboard loads and its interface is accessible.

### Test 3 — Tomato Image Analysis
1. Open the dashboard.
2. Select the tomato crop option.
3. Upload a clear tomato leaf image.
4. Start AI inference.
5. Observe the returned prediction, confidence score, image-quality information, and recommendation fields where available.

### Test 4 — Maize Image Analysis
1. Select the maize crop option, if available.
2. Upload a clear maize leaf image.
3. Run inference.
4. Observe the prediction and returned analysis fields.

### Test 5 — Image Quality
Try images with different lighting, focus, and image dimensions. Compare the reported brightness, sharpness, and quality warnings where available.

### Test 6 — Error Handling
Test an unsupported image or invalid request, if the interface permits. Verify that the application responds appropriately rather than displaying misleading results.

**Testing note:** Model predictions are estimates, not guaranteed diagnoses. Results should be validated by an agricultural expert before treatment decisions are made.

## 💻 Local Development

The backend source is designed to run with Python 3.11 and the dependencies listed in `requirements.txt`.

A typical local setup, when the complete backend source and required model files are available:

```bash
python -m venv .venv
```

Activate the virtual environment, then install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI development server:

```bash
python edge_ai_server.py
```

The expected local address is:

```text
http://localhost:8000
```

The exact startup procedure depends on the supplied source files, model paths, and environment configuration.

## ☁️ Deployment

The cloud deployment uses an AWS Lambda container image. The backend requires compatible Python dependencies, native libraries, trained model files, and writable cache locations.

The dashboard is hosted separately from the inference backend. Browser-to-API communication requires correct CORS configuration.

## 📁 Repository Contents

The competition repository should contain the source files, dependency manifests, Docker configuration, setup instructions, and other project assets approved for redistribution.

Trained model weights should be included only when their licenses and file-size constraints permit it.

## 🔐 Security

- Never commit AWS credentials, API keys, passwords, or private environment files.
- Store deployment secrets outside source control.
- Review model licenses and third-party dependencies before redistribution.

## ⚠️ Limitations

- Predictions depend on image quality, model training, and the supported crop categories.
- Poor lighting, blur, occlusion, or unfamiliar diseases may reduce prediction reliability.
- Cloud inference may be affected by cold starts, memory limits, request timeouts, or deployment availability.
- The system is intended as a decision-support tool and does not replace expert agricultural diagnosis.

## 🔭 Future Improvements

- Expand supported crops and disease categories.
- Improve model evaluation across field conditions.
- Add more comprehensive image-quality feedback.
- Improve inference latency and deployment reliability.
- Expand testing with independently collected agricultural images.

## 🏆 Competition Submission

**Project:** FarmXpert — AI-Powered Agronomy & Crop Health Analysis

**Focus:** OpenCV-based image processing, deep-learning inference, and agricultural decision support.

**Live Dashboard:** https://d1p1tenqj0s2gy.cloudfront.net

**Backend Health:** https://zarfg6ldbqtjfhoffjiqddvxcm0mwuka.lambda-url.ap-southeast-2.on.aws/api/v1/health
