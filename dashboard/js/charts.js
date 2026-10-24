/**
 * FarmXpert - Multi-Metric Responsive Trend Chart
 * Draws smooth spline multi-series chart with hover tooltips and dynamic time-range filter.
 */

class FarmTrendChart {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentRange = '7days';
    this.data = null;
    this.resizeObserver = null;
  }

  init(trendData, currentRange = '7days') {
    this.data = trendData;
    this.currentRange = currentRange;
    this.render();

    // Auto-resize on window change
    if (this.container) {
      window.addEventListener('resize', () => this.render());
    }
  }

  setRangeData(range, trendData) {
    this.currentRange = range;
    this.data = trendData;
    this.render();
  }

  render() {
    if (!this.container || !this.data) return;

    const width = this.container.clientWidth || 600;
    const height = 220;
    const padding = { top: 20, right: 30, bottom: 35, left: 45 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const labels = this.data.labels || [];
    const health = this.data.overall_health || [];
    const disease = this.data.disease_risk || [];
    const moisture = this.data.soil_moisture || [];

    const numPoints = labels.length;
    if (numPoints === 0) return;

    // Helper functions for coordinates
    const getX = (index) => padding.left + (index / (numPoints - 1)) * chartW;
    const getY = (val) => padding.top + chartH - ((val / 100) * chartH);

    // Generate smooth SVG paths
    const makePath = (values) => {
      let d = '';
      values.forEach((v, i) => {
        const x = getX(i);
        const y = getY(v);
        if (i === 0) {
          d += `M ${x} ${y}`;
        } else {
          const prevX = getX(i - 1);
          const prevY = getY(values[i - 1]);
          const cp1x = prevX + (x - prevX) / 2;
          const cp2x = cp1x;
          d += ` C ${cp1x} ${prevY}, ${cp2x} ${y}, ${x} ${y}`;
        }
      });
      return d;
    };

    const healthPath = makePath(health);
    const diseasePath = makePath(disease);
    const moisturePath = makePath(moisture);

    // Grid lines (0, 25, 50, 75, 100)
    const gridYValues = [0, 25, 50, 75, 100];
    const gridLinesSvg = gridYValues.map(v => {
      const y = getY(v);
      return `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
        <text x="${padding.left - 10}" y="${y + 4}" fill="#64748b" font-size="10" text-anchor="end" font-family="JetBrains Mono">${v}%</text>
      `;
    }).join('');

    // X-axis labels
    const xLabelsSvg = labels.map((lbl, i) => {
      const x = getX(i);
      return `<text x="${x}" y="${height - 10}" fill="#64748b" font-size="10" text-anchor="middle">${lbl}</text>`;
    }).join('');

    // Points with interactive hover
    const makePoints = (values, color, seriesName) => {
      return values.map((v, i) => {
        const x = getX(i);
        const y = getY(v);
        return `
          <circle 
            class="chart-dot"
            cx="${x}" 
            cy="${y}" 
            r="4" 
            fill="${color}" 
            stroke="#0d1218" 
            stroke-width="2"
            data-label="${labels[i]}"
            data-series="${seriesName}"
            data-value="${v}%"
            style="cursor: pointer; transition: r 0.2s;"
          />
        `;
      }).join('');
    };

    this.container.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
        <!-- Grid -->
        ${gridLinesSvg}
        ${xLabelsSvg}

        <!-- Gradient Fills under lines -->
        <defs>
          <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
          </linearGradient>
        </defs>

        <!-- Area paths -->
        <path d="${healthPath} L ${getX(numPoints - 1)} ${padding.top + chartH} L ${getX(0)} ${padding.top + chartH} Z" fill="url(#healthGrad)" />

        <!-- Line series -->
        <path d="${healthPath}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" />
        <path d="${diseasePath}" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" />
        <path d="${moisturePath}" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round" />

        <!-- Dots -->
        ${makePoints(health, '#10b981', 'Overall Health')}
        ${makePoints(disease, '#ef4444', 'Disease Risk')}
        ${makePoints(moisture, '#0ea5e9', 'Soil Moisture')}
      </svg>
      <div id="chartTooltip" class="chart-tooltip" style="display: none; position: absolute; background: #1b2737; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #fff; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 50;"></div>
    `;

    this.attachTooltipListeners();
  }

  attachTooltipListeners() {
    const tooltip = document.getElementById('chartTooltip');
    const dots = this.container.querySelectorAll('.chart-dot');

    dots.forEach(dot => {
      dot.addEventListener('mouseenter', (e) => {
        dot.setAttribute('r', '6');
        const label = dot.getAttribute('data-label');
        const series = dot.getAttribute('data-series');
        const val = dot.getAttribute('data-value');

        if (tooltip) {
          tooltip.innerHTML = `<strong>${label}</strong><br/><span style="color:#94a3b8;">${series}:</span> <span style="font-weight:700;">${val}</span>`;
          tooltip.style.display = 'block';
          tooltip.style.left = `${dot.cx.baseVal.value - 40}px`;
          tooltip.style.top = `${dot.cy.baseVal.value - 48}px`;
        }
      });

      dot.addEventListener('mouseleave', () => {
        dot.setAttribute('r', '4');
        if (tooltip) tooltip.style.display = 'none';
      });
    });
  }
}

window.FarmTrendChart = FarmTrendChart;
