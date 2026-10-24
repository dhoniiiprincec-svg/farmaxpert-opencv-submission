/**
 * FarmXpert - Plant Health Score Circular SVG Gauge Renderer
 */

class PlantHealthGauge {
  constructor(canvasContainerId, breakdownContainerId) {
    this.canvasContainer = document.getElementById(canvasContainerId);
    this.breakdownContainer = document.getElementById(breakdownContainerId);
  }

  render(scoreData) {
    if (!this.canvasContainer) return;

    const score = scoreData?.overall_score ?? 68;
    const maxScore = scoreData?.max_score ?? 100;
    const status = scoreData?.status ?? "MODERATE";

    // SVG geometry calculations
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const percentage = score / maxScore;
    const strokeDashoffset = circumference - (percentage * circumference * 0.75); // 270 degree arc

    let strokeColor = '#10b981';
    let statusClass = 'badge-healthy';

    if (score < 50) {
      strokeColor = '#ef4444';
      statusClass = 'badge-danger';
    } else if (score < 75) {
      strokeColor = '#f59e0b';
      statusClass = 'badge-warning';
    }

    this.canvasContainer.innerHTML = `
      <svg width="130" height="130" viewBox="0 0 130 130" class="gauge-svg">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10b981" />
            <stop offset="65%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#ef4444" />
          </linearGradient>
        </defs>
        <!-- Background Track -->
        <circle
          cx="65"
          cy="65"
          r="${radius}"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          stroke-width="10"
          stroke-dasharray="${circumference * 0.75} ${circumference * 0.25}"
          stroke-dashoffset="-${circumference * 0.125}"
          stroke-linecap="round"
          transform="rotate(135 65 65)"
        />
        <!-- Active Value Arc -->
        <circle
          cx="65"
          cy="65"
          r="${radius}"
          fill="none"
          stroke="${strokeColor}"
          stroke-width="10"
          stroke-dasharray="${circumference * 0.75} ${circumference * 0.25}"
          stroke-dashoffset="${strokeDashoffset}"
          stroke-linecap="round"
          transform="rotate(135 65 65)"
          style="transition: stroke-dashoffset 1s ease-out, stroke 0.5s ease;"
        />
      </svg>
      <div class="gauge-center-content">
        <span class="gauge-score">${score}</span>
        <span class="gauge-score-sub">/ ${maxScore}</span>
        <span class="badge ${statusClass} gauge-status-badge">${status}</span>
      </div>
    `;

    // Render Sub-metrics Breakdown
    if (this.breakdownContainer && scoreData?.sub_metrics) {
      const { growth_rate, leaf_health, stress_level } = scoreData.sub_metrics;

      this.breakdownContainer.innerHTML = `
        <div class="gauge-breakdown-item">
          <div class="gauge-breakdown-header">
            <span>${growth_rate.label}</span>
            <span style="color: #34d399;">${growth_rate.status}</span>
          </div>
          <div class="gauge-mini-bar">
            <div class="gauge-mini-fill fill-good" style="width: ${growth_rate.value}%"></div>
          </div>
        </div>

        <div class="gauge-breakdown-item">
          <div class="gauge-breakdown-header">
            <span>${leaf_health.label}</span>
            <span style="color: #fbbf24;">${leaf_health.status}</span>
          </div>
          <div class="gauge-mini-bar">
            <div class="gauge-mini-fill fill-mod" style="width: ${leaf_health.value}%"></div>
          </div>
        </div>

        <div class="gauge-breakdown-item">
          <div class="gauge-breakdown-header">
            <span>${stress_level.label}</span>
            <span style="color: #fbbf24;">${stress_level.status}</span>
          </div>
          <div class="gauge-mini-bar">
            <div class="gauge-mini-fill fill-mod" style="width: ${stress_level.value}%"></div>
          </div>
        </div>
      `;
    }
  }
}

window.PlantHealthGauge = PlantHealthGauge;
