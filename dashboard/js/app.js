/**
 * FarmXpert - Main Application Controller + Live Phone Camera
 */

document.addEventListener('DOMContentLoaded', async () => {
  const zoneMapRenderer = new FarmZoneMapRenderer('zoneMapCanvas');
  const healthGauge = new PlantHealthGauge('gaugeCanvasContainer', 'gaugeBreakdownContainer');
  const trendChart = new FarmTrendChart('trendChartContainer');

  const refreshBtn = document.getElementById('refreshBtn');
  const edgeApiBadge = document.getElementById('edgeApiBadge');
  const statusBanner = document.getElementById('statusBanner');
  const statusBannerText = document.getElementById('statusBannerText');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('appSidebar');

  const data = await window.apiService.getFarmOverview();
  renderDashboard(data);
  zoneMapRenderer.init(data.zones);
  healthGauge.render(data.plant_health_score);
  trendChart.init(data.historical_trends['7days'], '7days');

  window.apiService.subscribe((event, payload) => {
    if (event === 'data_updated') {
      renderDashboard(payload);
      zoneMapRenderer.update(payload.zones);
      healthGauge.render(payload.plant_health_score);
    } else if (event === 'connection_change') {
      updateConnectionStatus(payload.connected);
    }
  });

  window.apiService.startPolling((updated) => renderDashboard(updated));
  window.apiService.testConnection();
  setupLiveCamera();
  setupLeafUpload();

  function renderDashboard(d) {
    if (!d) return;
    if (d.environmental) {
      document.getElementById('envTemp').textContent = `${d.environmental.temperature}°C`;
      document.getElementById('envHum').textContent = `${d.environmental.humidity}%`;
      document.getElementById('envLight').textContent = `${d.environmental.light_intensity} lux`;
      document.getElementById('envWind').textContent = `${d.environmental.wind_speed} km/h`;
    }
    if (d.soil) {
      document.getElementById('soilMoist').textContent = `${d.soil.soil_moisture}%`;
      document.getElementById('soilPh').textContent = `${d.soil.soil_ph} pH`;
      document.getElementById('soilEc').textContent = `${d.soil.electrical_conductivity} dS/m`;
      document.getElementById('soilHealth').textContent = d.soil.soil_health;
    }
    if (d.top_priorities?.nutrition) {
      const nut = d.top_priorities.nutrition;
      document.getElementById('nutStatusBadge').textContent = nut.status;
      document.getElementById('nutHeadline').textContent = nut.primary_deficiency;
      document.getElementById('nutZones').textContent = (nut.affected_zones || []).join(', ');
    }
    if (d.top_priorities?.disease) {
      const dis = d.top_priorities.disease;
      document.getElementById('disStatusBadge').textContent = dis.status;
      document.getElementById('disHeadline').textContent = dis.disease_name;
      document.getElementById('disSeverityVal').textContent = `${dis.severity}%`;
      document.getElementById('disSeverityBar').style.width = `${dis.severity}%`;
      document.getElementById('disZones').textContent = (dis.affected_zones || []).join(', ');
    }
    if (d.top_priorities?.irrigation) {
      const irg = d.top_priorities.irrigation;
      document.getElementById('irgStatusBadge').textContent = irg.status;
      document.getElementById('irgHeadline').textContent = (irg.affected_zones || []).join(', ');
      document.getElementById('irgNext').textContent = irg.next_irrigation;
      document.getElementById('irgNeed').textContent = irg.water_need;
    }
    if (d.quick_summary) {
      document.getElementById('sumTotalPlants').textContent = d.quick_summary.total_plants;
      document.getElementById('sumHealthyPlants').textContent = d.quick_summary.healthy_plants;
      document.getElementById('sumDiseasedPlants').textContent = d.quick_summary.diseased_plants;
      document.getElementById('sumWaterUsed').textContent = d.quick_summary.water_used_today;
      document.getElementById('sumYield').textContent = d.quick_summary.estimated_yield;
    }
  }

  function updateConnectionStatus(isConnected) {
    if (isConnected) {
      if (edgeApiBadge) {
        edgeApiBadge.innerHTML = `<span class="pulse-dot"></span> <span>Edge-AI Live</span>`;
        edgeApiBadge.style.borderColor = 'rgba(16,185,129,.4)';
        edgeApiBadge.style.color = '#34d399';
      }
      if (statusBanner) {
        statusBanner.className = 'status-banner banner-connected';
        statusBannerText.innerHTML = '<strong>Edge-AI Connected:</strong> Receiving real-time inference telemetry.';
      }
    } else {
      if (edgeApiBadge) {
        edgeApiBadge.innerHTML = '<span class="pulse-dot" style="background:#f59e0b;box-shadow:0 0 8px #f59e0b;"></span> <span>Edge-AI Simulator</span>';
        edgeApiBadge.style.borderColor = 'rgba(245,158,11,.4)';
        edgeApiBadge.style.color = '#fbbf24';
      }
      if (statusBanner) {
        statusBanner.className = 'status-banner';
        statusBannerText.innerHTML = '<strong>Edge-AI connection unavailable:</strong> Displaying latest available data.';
      }
    }
  }

  refreshBtn?.addEventListener('click', async () => {
    refreshBtn.classList.add('spin-animation');
    const fresh = await window.apiService.getFarmOverview();
    renderDashboard(fresh);
    zoneMapRenderer.update(fresh.zones);
    healthGauge.render(fresh.plant_health_score);
    window.modalManager.showToast('Dashboard synchronized with latest telemetry', 'success');
    setTimeout(() => refreshBtn.classList.remove('spin-animation'), 600);
  });

  edgeApiBadge?.addEventListener('click', () => window.modalManager.openApiConfigModal());

  document.querySelectorAll('.time-filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.time-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const range = btn.getAttribute('data-range');
      const trendData = await window.apiService.getHistoricalTrends(range);
      trendChart.setRangeData(range, trendData);
    });
  });

  document.getElementById('toggleNdviBtn')?.addEventListener('click', function () {
    const isNdvi = zoneMapRenderer.toggleNdviMode();
    this.textContent = isNdvi ? '🌿 Normal View' : '🛰️ NDVI View';
    this.classList.toggle('btn-primary', isNdvi);
    this.classList.toggle('btn-outline', !isNdvi);
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const page = item.getAttribute('data-page');
      if (page !== 'overview') window.modalManager.showToast(`Switched view to ${item.textContent.trim()}`, 'info');
      if (window.innerWidth <= 768) sidebar.classList.remove('mobile-open');
    });
  });

  mobileMenuToggle?.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
  document.getElementById('notifBellBtn')?.addEventListener('click', () => window.modalManager.openAllAlertsModal());
  document.getElementById('userProfileCard')?.addEventListener('click', () => window.modalManager.openFarmSwitcherModal());


  // ---------------------------------------------------------------------------
  // UPLOAD LEAF IMAGE -> FastAPI -> YOLO -> Main Dashboard
  // ---------------------------------------------------------------------------
  function setupLeafUpload() {
    const fileInput = document.getElementById('farmaxpertLeafFile');
    const chooseBtn = document.getElementById('farmaxpertChooseLeafBtn');
    const analyzeBtn = document.getElementById('farmaxpertAnalyzeLeafBtn');
    const cropSelect = document.getElementById('farmaxpertCropSelect');
    const previewWrap = document.getElementById('farmaxpertUploadPreviewWrap');
    const preview = document.getElementById('farmaxpertUploadPreview');
    const fileName = document.getElementById('farmaxpertSelectedFileName');
    const status = document.getElementById('farmaxpertUploadStatus');
    const recommendation = document.getElementById('farmaxpertUploadRecommendation');
    const opencvPanel = document.getElementById('farmaxpertOpenCVQuality');
    const opencvMessage = document.getElementById('farmaxpertOpenCVMessage');
    const opencvMetrics = document.getElementById('farmaxpertOpenCVMetrics');

    if (!fileInput || !chooseBtn || !analyzeBtn || !cropSelect || !status) return;

    let selectedFile = null;
    const inferenceBase = `${window.apiService.getApiBaseUrl()}/inference/image`;

    function setUploadStatus(message, isError = false) {
      status.textContent = message;
      status.style.background = isError ? 'rgba(239,68,68,.10)' : 'rgba(16,185,129,.08)';
      status.style.color = isError ? '#fca5a5' : 'var(--text-primary, inherit)';
    }

    chooseBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      selectedFile = fileInput.files?.[0] || null;
      analyzeBtn.disabled = !selectedFile;
      if (recommendation) recommendation.style.display = 'none';

      if (!selectedFile) {
        if (previewWrap) previewWrap.style.display = 'none';
        setUploadStatus('Choose a tomato or maize leaf image to begin.');
        return;
      }

      if (!selectedFile.type.startsWith('image/')) {
        selectedFile = null;
        analyzeBtn.disabled = true;
        setUploadStatus('Please choose a valid JPG, PNG, or WEBP image.', true);
        return;
      }

      if (preview) {
        if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
        preview.dataset.objectUrl = URL.createObjectURL(selectedFile);
        preview.src = preview.dataset.objectUrl;
      }
      if (previewWrap) previewWrap.style.display = 'block';
      if (fileName) fileName.textContent = selectedFile.name;
      setUploadStatus('Image ready. Click Analyze Image to send it to the AI model.');
    });

    analyzeBtn.addEventListener('click', async () => {
      if (!selectedFile) {
        setUploadStatus('Choose a leaf image first.', true);
        return;
      }

      const crop = cropSelect.value;
      const form = new FormData();
      form.append('file', selectedFile, selectedFile.name);
      const requestUrl = `${inferenceBase}?crop=${encodeURIComponent(crop)}`;

      analyzeBtn.disabled = true;
      chooseBtn.disabled = true;
      setUploadStatus(`Uploading image and running ${crop} AI inference…`);
      if (recommendation) recommendation.style.display = 'none';

      try {
        const response = await fetch(requestUrl, { method: 'POST', body: form });
        const raw = await response.text();
        let result = {};
        try { result = raw ? JSON.parse(raw) : {}; }
        catch { result = { detail: raw }; }

        if (!response.ok) {
          const detail = result.detail || result.message || result.error || `HTTP ${response.status}`;
          throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
        }
        if (result.success === false) {
          throw new Error(result.message || result.error || 'The AI model could not analyze this image.');
        }
        // Handle OpenCV agent decision: request a retake
if (
  result.needs_retake ||
  result.agent_decision === 'REQUEST_CLEARER_IMAGE'
) {if (opencvPanel) opencvPanel.style.display = 'block';

  if (opencvMessage) {
    opencvMessage.textContent =
      `⚠️ Retake required: ${(result.opencv?.quality_warnings || []).join(' ')}`;
  }

  if (opencvMetrics && result.opencv) {
    const cv = result.opencv;
    opencvMetrics.textContent =
      `OpenCV ${cv.version} | ${cv.image_width} × ${cv.image_height} | ` +
      `Brightness: ${cv.brightness} | Sharpness: ${cv.sharpness}`;
  }

  setUploadStatus(
    result.recommendation || 'Please capture a clearer leaf image.',
    true
  );

  if (recommendation) {
    recommendation.textContent = result.recommendation;
    recommendation.style.display = 'block';
  }

  return;
}  

    // Handle low-confidence predictions: request a second image
    if (result.agent_decision === 'REQUEST_SECOND_IMAGE') {
      if (opencvPanel) {
        opencvPanel.style.display = 'block';
      }

      if (opencvMessage) {
        opencvMessage.textContent =
          `🔎 Second image required: ${result.disease_name || 'Uncertain prediction'} ` +
          `(${(Number(result.confidence || 0) * 100).toFixed(1)}% confidence).`;
      }

      if (opencvMetrics && result.opencv) {
        const cv = result.opencv;
        opencvMetrics.textContent =
          `OpenCV ${cv.version} | ${cv.image_width} × ${cv.image_height} | ` +
          `Brightness: ${cv.brightness} | Sharpness: ${cv.sharpness}`;
      }

      setUploadStatus(
        'Please capture the same leaf again from a different angle.',
        true
      );

      if (recommendation) {
        recommendation.textContent =
          result.recommendation ||
          'Capture another clear image or request human review before treatment.';
        recommendation.style.display = 'block';
      }

      return;
    }


        const detections = result.detections || [];
        // Display OpenCV image-quality analysis
if (opencvPanel) {
  opencvPanel.style.display = 'block';

  const cv = result.opencv;

  if (cv) {
    const quality = cv.image_quality || 'UNKNOWN';
    const warnings = cv.quality_warnings || [];

    if (opencvMessage) {
      opencvMessage.textContent = warnings.length
        ? `⚠️ Image Quality: ${quality} — ${warnings.join(', ')}`
        : `✅ Image Quality: ${quality} — ${warnings.length === 0 ? 'No quality warnings' : ''}`;
    }

    if (opencvMetrics) {
      opencvMetrics.textContent =
        `OpenCV: ${cv.version || 'N/A'} | ` +
        `Resolution: ${cv.image_width || 'N/A'} × ${cv.image_height || 'N/A'} | ` +
        `Brightness: ${Number(cv.brightness ?? 0).toFixed(2)} | ` +
        `Sharpness: ${Number(cv.sharpness ?? 0).toFixed(2)}`;
    }

    opencvPanel.style.borderColor = warnings.length
      ? 'rgba(245,158,11,.5)'
      : 'rgba(16,185,129,.3)';
  } else {
    if (opencvMessage) {
      opencvMessage.textContent =
        'OpenCV quality data was not returned by the backend.';
    }
    if (opencvMetrics) opencvMetrics.textContent = '';
  }
}
        const top = detections[0] || {};
        const disease = result.disease_name || top.class_name || result.prediction ||
          result.class_name || result.predicted_class || 'No disease label returned';
        const confidence = Number(result.confidence ?? top.confidence ?? result.confidence_score ?? 0);
        const percent = Math.max(0, Math.min(100, confidence <= 1 ? confidence * 100 : confidence));
        const risk = result.risk || result.risk_level || result.severity || 'UNKNOWN';
        const advice = result.recommendation || result.advice || result.treatment || result.guidance;

        const headline = document.getElementById('disHeadline');
        const badge = document.getElementById('disStatusBadge');
        const severityVal = document.getElementById('disSeverityVal');
        const severityBar = document.getElementById('disSeverityBar');
        if (headline) headline.textContent = String(disease).replaceAll('_', ' ');
        if (badge) badge.textContent = `${risk} RISK`;
        if (severityVal) severityVal.textContent = `${percent.toFixed(1)}%`;
        if (severityBar) severityBar.style.width = `${percent}%`;

        const summary = [
          `Prediction: ${String(disease).replaceAll('_', ' ')}`,
          `Confidence: ${percent.toFixed(1)}%`,
          `Risk: ${risk}`,
          `${detections.length} detection(s)`
        ].join(' · ');
        setUploadStatus(`AI analysis complete — ${summary}`);

        if (recommendation && advice) {
          recommendation.textContent = `Recommendation: ${advice}`;
          recommendation.style.display = 'block';
        }
      } catch (err) {
        console.error('FarmXpert uploaded-image inference failed:', err);
        setUploadStatus(`AI request failed: ${err.message || String(err)}`, true);
      } finally {
        analyzeBtn.disabled = !selectedFile;
        chooseBtn.disabled = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // LIVE PHONE CAMERA -> FastAPI -> YOLO -> Dashboard
  // ---------------------------------------------------------------------------
  function setupLiveCamera() {
    const video = document.getElementById('cameraFeed');
    const canvas = document.getElementById('cameraCanvas');
    const startBtn = document.getElementById('startCameraBtn');
    const stopBtn = document.getElementById('stopCameraBtn');
    const status = document.getElementById('cameraStatus');
    const placeholder = document.getElementById('cameraPlaceholder');
    const resultBox = document.getElementById('cameraDetectionResult');
    if (!video || !canvas || !startBtn) return;

    let stream = null;
    let timer = null;
    let busy = false;
    let running = false;

    // Same-origin is critical when the dashboard is opened through the public tunnel.
    const inferenceUrl = `${window.apiService.getApiBaseUrl()}/inference/image`;

    startBtn.addEventListener('click', async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        resultBox.textContent = 'Camera access is unavailable. Open this page using HTTPS (or localhost).';
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        video.srcObject = stream;
        video.style.display = 'block';
        placeholder.style.display = 'none';
        status.textContent = 'AI Live';
        status.className = 'badge badge-healthy';
        startBtn.disabled = true;
        stopBtn.disabled = false;
        running = true;
        resultBox.textContent = 'Camera started. Analysing the crop…';
        timer = setInterval(captureAndInfer, 1200);
        captureAndInfer();
      } catch (err) {
        resultBox.textContent = `Camera could not start: ${err.message}`;
      }
    });

    stopBtn.addEventListener('click', stopCamera);

    function stopCamera() {
      running = false;
      if (timer) clearInterval(timer);
      timer = null;
      if (stream) stream.getTracks().forEach(t => t.stop());
      stream = null;
      video.srcObject = null;
      video.style.display = 'none';
      placeholder.style.display = 'block';
      status.textContent = 'Camera Off';
      status.className = 'badge badge-warning';
      startBtn.disabled = false;
      stopBtn.disabled = true;
      resultBox.textContent = 'Live detection stopped.';
    }

    async function captureAndInfer() {
      if (!running || busy || video.readyState < 2) return;
      busy = true;
      try {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.72));
        if (!blob) return;

        const form = new FormData();
        form.append('file', blob, 'phone-camera.jpg');
        const response = await fetch(inferenceUrl, { method: 'POST', body: form });
        if (!response.ok) throw new Error(`Inference HTTP ${response.status}`);
        const data = await response.json();
        updateLiveDetection(data);
      } catch (err) {
        resultBox.textContent = `Live inference error: ${err.message}`;
      } finally {
        busy = false;
      }
    }

    
function updateLiveDetection(data) {
  if (!data?.success) return;

  const detections = data.detections || [];
  const top = detections[0] || {};

  const name =
    data.disease_name ||
    top.class_name ||
    'Healthy / No detection';

  const rawConfidence = Number(
    data.confidence ?? top.confidence ?? 0
  );

  const percent = Math.round(
    Math.max(0, Math.min(100,
      rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence
    ))
  );

  const risk = data.risk || data.risk_level || 'LOW';
  const decision = data.agent_decision || '';
  const warnings = data.opencv?.quality_warnings || [];

  let message = '';
  let needsHumanReview = false;

  // 1. Poor-quality image: ask for a clearer frame.
  if (
    data.needs_retake ||
    decision === 'REQUEST_CLEARER_IMAGE' ||
    warnings.length > 0
  ) {
    message =
      '⚠️ Image quality warning. Keep the leaf steady, improve lighting, ' +
      'and capture a clearer frame.';
  }

  // 2. Low-confidence prediction: request another image.
  else if (
    decision === 'REQUEST_SECOND_IMAGE' ||
    (detections.length > 0 && rawConfidence < 0.45)
  ) {
    message =
      `🔎 Uncertain prediction (${percent}% confidence). ` +
      'Capture another image from a different angle.';
    needsHumanReview = true;
  }

  // 3. Disease detected: recommend inspection and human confirmation.
  else if (
    decision === 'INSPECT_AFFECTED_PLANTS' ||
    (detections.length > 0 && percent >= 45)
  ) {
    message =
      `🌿 ${name} detected. Inspect nearby plants and request ` +
      'human confirmation before treatment.';
    needsHumanReview = true;
  }

  // 4. No disease detected: continue monitoring.
  else {
    message = '✅ No confident disease detection. Continue monitoring.';
  }

  // Update the live result panel.
  resultBox.textContent =
    `${name} | Confidence: ${percent}% | Risk: ${risk} | ` +
    `${detections.length} detection(s). ${message}`;

  const headline = document.getElementById('disHeadline');
  const badge = document.getElementById('disStatusBadge');
  const severityVal = document.getElementById('disSeverityVal');
  const severityBar = document.getElementById('disSeverityBar');

  if (headline) headline.textContent = name;
  if (badge) badge.textContent = `${risk} RISK`;
  if (severityVal) severityVal.textContent = `${percent}%`;
  if (severityBar) severityBar.style.width = `${percent}%`;

  // Show the decision in the existing recommendation panel.
  if (recommendation) {
    recommendation.textContent = message;
    recommendation.style.display = 'block';
  }

  // Expose the review status for the next UI step.
  resultBox.dataset.humanReviewRequired =
    String(needsHumanReview);
}


    function escapeHtml(value) {
      return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
    }
  }
});
