

\# Farmaxpert — Local Deployment Guide



\## 1. Project Overview



Farmaxpert is a smart farming assistant that combines crop-leaf image inference, OpenCV image-quality checks, sensor-based risk assessment, and a web dashboard.



The deployment package includes:

\- Tomato and maize YOLO models

\- FastAPI inference backend

\- Web dashboard and camera page

\- Python dependency lists



\## 2. Requirements



\- Python 3.11 recommended

\- Internet access for initial dependency installation

\- Sufficient disk space and RAM for the AI libraries and models

\- A modern browser and camera permission for camera testing



A compatible GPU is optional; CPU inference may be slower.



\## 3. Windows Setup



Open PowerShell in the project folder:



```powershell

cd D:\\PROJECTS\\FARMAXPERT\_DEPLOY



python -m venv .venv

.\\.venv\\Scripts\\Activate.ps1



python -m pip install --upgrade pip

pip install -r requirements.txt

```



If PowerShell blocks activation, use Command Prompt or run the virtual environment's Python directly.



\## 4. Start the Backend and Dashboard



From the project folder, run:



```powershell

python edge\_ai\_server.py

```



Keep the terminal open while using Farmaxpert.



Open these URLs in your browser:



\- Dashboard: http://localhost:8000/

\- Health check: http://localhost:8000/api/v1/health



The health endpoint should return a healthy status.



\## 5. Test Crop Inference



1\. Open the dashboard.

2\. Navigate to the crop detection or camera page.

3\. Select the correct crop.

4\. Upload a clear leaf image or test the camera.

5\. Review the prediction, confidence, risk information, and recommendations.



Use separate, correctly labelled tomato and maize images when validating each model. A successful API response alone does not prove prediction accuracy.



\## 6. Sensor Endpoint



Use the dashboard or the documented API endpoint to submit sensor readings.



Sensor risk outputs may use programmed rules. Do not interpret them as validated agricultural diagnoses unless they have been tested against real field data.



\## 7. API URL Configuration



The dashboard may use the browser's local hostname and port 8000 by default.



If the backend runs on another computer or port, configure the dashboard's API base URL to the reachable backend address, including `/api/v1`.



Do not expose the backend publicly without appropriate authentication, network restrictions, and security review.



\## 8. Linux Setup



Install Python 3.11 and the operating-system packages needed by Python, OpenCV, and PyTorch.



Then, from the project directory:



```bash

python3 -m venv .venv

source .venv/bin/activate



python -m pip install --upgrade pip

pip install -r requirements.txt



uvicorn edge\_ai\_server:app --host 0.0.0.0 --port 8000

```



Open `http://localhost:8000/` on the same machine.



For access from another device, use the server's reachable LAN address and configure the dashboard API URL accordingly. Only allow trusted devices to connect.



\## 9. Troubleshooting



\*\*Backend does not start\*\*

\- Activate the correct virtual environment.

\- Install dependencies from `requirements.txt`.

\- Check the terminal for the first Python error.



\*\*Model file not found\*\*

\- Confirm these files exist:

&#x20; - `models/tomato\_best.pt`

&#x20; - `models/maize\_best.pt`



\*\*Dashboard loads but inference fails\*\*

\- Check that the backend is running.

\- Open the health endpoint.

\- Verify the configured API URL and browser console errors.



\*\*Camera does not open\*\*

\- Allow browser camera permission.

\- Use localhost or a secure HTTPS page where required by the browser.

\- Confirm the camera page points to the correct backend URL.



\*\*Predictions appear inaccurate\*\*

\- Test with clear, well-lit images of the correct crop.

\- Review confidence and image-quality results.

\- Validate against labelled images before using predictions for farm decisions.



\## 10. Deployment Checklist



\- \[ ] Health endpoint responds successfully

\- \[ ] Dashboard loads

\- \[ ] Tomato inference tested with tomato images

\- \[ ] Maize inference tested with maize images

\- \[ ] Camera and upload workflows tested

\- \[ ] Model files and dependency lists included in the package

\- \[ ] ZIP refreshed after final changes

\- \[ ] No secrets or private credentials included

\- \[ ] Risk outputs and recommendations validated before real-world use



\## Important



This guide describes local testing. It does not claim that Farmaxpert has been deployed to a public production server or independently validated for agricultural decision-making.



