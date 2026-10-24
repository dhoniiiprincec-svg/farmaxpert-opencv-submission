/**
 * FarmXpert - Interactive Agricultural Zone Map Renderer
 * Renders realistic top-down plot textures, health boundaries, sensor markers, and handles zone clicks.
 */

class FarmZoneMapRenderer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.zonesData = [];
    this.isNdviMode = false;
    this.selectedZoneId = null;
  }

  init(zonesData) {
    this.zonesData = zonesData || [];
    this.render();
  }

  update(zonesData) {
    this.zonesData = zonesData || [];
    this.render();
  }

  toggleNdviMode() {
    this.isNdviMode = !this.isNdviMode;
    this.render();
    return this.isNdviMode;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="zones-grid-overlay">
        ${this.zonesData.map(zone => this.renderZonePlot(zone)).join('')}
      </div>
      <div class="radar-scan"></div>
    `;

    // Attach click listeners
    this.container.querySelectorAll('.zone-plot-card').forEach(card => {
      card.addEventListener('click', () => {
        const zoneId = card.getAttribute('data-zone-id');
        const zone = this.zonesData.find(z => z.zone_id === zoneId);
        if (zone && window.modalManager) {
          window.modalManager.openZoneDetails(zone);
        }
      });
    });
  }

  renderZonePlot(zone) {
    let statusClass = 'zone-healthy';
    let statusBadgeClass = 'badge-healthy';
    let statusText = 'Healthy';
    let borderAccent = '#10b981';

    if (zone.status_type === 'risk' || zone.overall_risk === 'HIGH') {
      statusClass = 'zone-risk';
      statusBadgeClass = 'badge-danger';
      statusText = 'High Risk';
      borderAccent = '#ef4444';
    } else if (zone.status_type === 'attention' || zone.irrigation_required || zone.overall_risk === 'ATTENTION') {
      statusClass = 'zone-attention';
      statusBadgeClass = 'badge-warning';
      statusText = zone.status_label || 'Irrigation Needed';
      borderAccent = '#f59e0b';
    }

    const ndviColor = this.isNdviMode ? this.getNdviStyle(zone.plant_health) : '';

    return `
      <div class="zone-plot-card ${statusClass}" data-zone-id="${zone.zone_id}" style="${ndviColor}">
        <div class="zone-header-row">
          <div class="zone-id-tag">${zone.zone_name}</div>
          <span class="badge ${statusBadgeClass}">${statusText}</span>
        </div>

        <div class="zone-plot-body">
          <div class="zone-crop-tag">🌱 ${zone.crop} • ${zone.area}</div>
          <div class="zone-status-text">${zone.disease_detected ? '⚠️ ' + zone.disease_name : (zone.irrigation_required ? '💧 Drip Req.' : '✓ Optimal Growth')}</div>
          <div class="zone-mini-meta">Moisture: ${zone.soil_moisture}% | Health: ${zone.plant_health}%</div>
        </div>

        <div class="zone-plot-footer">
          <div class="sensor-pin-indicator">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.4 11.5 7.7 11.8a.5.5 0 0 0 .6 0c.3-.3 7.7-6.4 7.7-11.8a8 8 0 0 0-8-8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Node #${zone.zone_id.toUpperCase()}</span>
          </div>
          <span style="color: ${borderAccent}; font-weight: 700;">Inspect ➔</span>
        </div>
      </div>
    `;
  }

  getNdviStyle(health) {
    if (health >= 85) return 'background: linear-gradient(135deg, rgba(34, 197, 94, 0.45) 0%, rgba(20, 83, 45, 0.6) 100%) !important;';
    if (health >= 60) return 'background: linear-gradient(135deg, rgba(234, 179, 8, 0.45) 0%, rgba(113, 63, 18, 0.6) 100%) !important;';
    return 'background: linear-gradient(135deg, rgba(239, 68, 68, 0.45) 0%, rgba(127, 29, 29, 0.6) 100%) !important;';
  }
}

window.FarmZoneMapRenderer = FarmZoneMapRenderer;
