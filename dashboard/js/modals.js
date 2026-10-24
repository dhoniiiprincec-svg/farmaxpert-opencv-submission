/**
 * FarmXpert - Modal Manager & Interactive Action Drawers
 */

class FarmModalManager {
  constructor() {
    this.overlay = document.getElementById('globalModalOverlay');
    this.container = document.getElementById('globalModalContainer');
    this.activeModal = null;
    this.init();
  }

  init() {
    if (!this.overlay) return;

    // Close modal when clicking outside or press ESC
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) this.close();
    });
  }

  open(titleHtml, bodyHtml, footerHtml = '') {
    if (!this.overlay || !this.container) return;

    this.container.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">${titleHtml}</div>
        <button class="modal-close-btn" id="modalCloseBtn">&times;</button>
      </div>
      <div class="modal-body">
        ${bodyHtml}
      </div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
    `;

    document.getElementById('modalCloseBtn')?.addEventListener('click', () => this.close());
    this.overlay.classList.add('active');
    this.activeModal = true;
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove('active');
    this.activeModal = null;
  }

  showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : (type === 'danger' ? '⚠️' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /**
   * 1. Zone Inspection Modal
   */
  openZoneDetails(zone) {
    const title = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--primary);"><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.4 11.5 7.7 11.8a.5.5 0 0 0 .6 0c.3-.3 7.7-6.4 7.7-11.8a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg> ${zone.zone_name} • Sector Telemetry`;
    
    const isRisk = zone.overall_risk === 'HIGH' || zone.disease_detected;
    const isIrrig = zone.irrigation_required;

    const body = `
      <div style="display:flex; flex-direction:column; gap:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface-subtle); padding:12px 16px; border-radius:8px; border:1px solid var(--border-subtle);">
          <div>
            <div style="font-size:16px; font-weight:700; color:#fff;">${zone.crop} (${zone.variety})</div>
            <div style="font-size:12px; color:var(--text-muted);">${zone.sector} • Area: ${zone.area}</div>
          </div>
          <span class="badge ${isRisk ? 'badge-danger' : (isIrrig ? 'badge-warning' : 'badge-healthy')}">
            ${zone.status_label || (isRisk ? 'High Risk' : (isIrrig ? 'Irrigation Needed' : 'Healthy'))}
          </span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">
          <div style="background:var(--bg-card-hover); padding:10px 14px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-size:11px; color:var(--text-muted);">Plant Health</div>
            <div style="font-size:18px; font-weight:700; color:#fff; font-family:var(--font-mono);">${zone.plant_health}%</div>
          </div>
          <div style="background:var(--bg-card-hover); padding:10px 14px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-size:11px; color:var(--text-muted);">Soil Moisture</div>
            <div style="font-size:18px; font-weight:700; color:${zone.soil_moisture < 30 ? '#fbbf24' : '#38bdf8'}; font-family:var(--font-mono);">${zone.soil_moisture}%</div>
          </div>
          <div style="background:var(--bg-card-hover); padding:10px 14px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-size:11px; color:var(--text-muted);">Temperature</div>
            <div style="font-size:18px; font-weight:700; color:#fff; font-family:var(--font-mono);">${zone.temperature}°C</div>
          </div>
          <div style="background:var(--bg-card-hover); padding:10px 14px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-size:11px; color:var(--text-muted);">Humidity</div>
            <div style="font-size:18px; font-weight:700; color:#fff; font-family:var(--font-mono);">${zone.humidity}%</div>
          </div>
        </div>

        <div style="background:var(--bg-surface-subtle); padding:12px 16px; border-radius:8px; border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:6px;">
          <div style="font-size:12px; font-weight:700; color:var(--text-secondary);">Nutrition & Pathology:</div>
          <div style="font-size:12px; color:#fff;">• Nutrition Status: <strong>${zone.nutrition_status}</strong> (Deficiency: ${zone.nutrient_deficiency})</div>
          <div style="font-size:12px; color:#fff;">• Disease Detection: <strong>${zone.disease_detected ? zone.disease_name + ' (' + zone.disease_severity + '% severity)' : 'No pathogens detected'}</strong></div>
          <div style="font-size:12px; color:#fff;">• Irrigation Priority: <strong>${zone.irrigation_priority}</strong></div>
        </div>

        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:8px; padding:12px 16px;">
          <div style="font-size:11px; font-weight:700; color:var(--primary); text-transform:uppercase;">AI Agronomist Recommendation</div>
          <div style="font-size:13px; color:#f8fafc; margin-top:4px;">${zone.recommendation}</div>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline btn-sm" onclick="modalManager.close()">Close</button>
      ${zone.irrigation_required ? `<button class="btn btn-primary btn-sm" onclick="modalManager.triggerIrrigation('${zone.zone_name}')">💧 Trigger Irrigation</button>` : ''}
    `;

    this.open(title, body, footer);
  }

  /**
   * 2. Plant Nutrition Deep-dive Modal
   */
  openNutritionModal() {
    const title = `<span style="color:var(--primary)">🌿</span> Plant Nutrition Diagnosis & Advisory`;
    const body = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); padding:14px; border-radius:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#fbbf24; font-size:14px;">Nitrogen (N) Deficiency Detected</strong>
            <span class="badge badge-warning">MODERATE RISK</span>
          </div>
          <p style="font-size:12px; color:var(--text-secondary); margin-top:6px;">
            Chlorosis patterns detected on lower canopy in <strong>Zone 2 (Chilli)</strong> and <strong>Zone 4 (Brinjal)</strong>.
          </p>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <h4 style="font-size:13px; color:#fff;">Nutrient Balance Telemetry</h4>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; text-align:center;">
            <div style="background:var(--bg-surface-subtle); padding:10px; border-radius:8px; border:1px solid var(--border-subtle);">
              <div style="font-size:10px; color:var(--text-muted);">Nitrogen (N)</div>
              <div style="font-size:16px; font-weight:700; color:#f87171;">Low (18 ppm)</div>
            </div>
            <div style="background:var(--bg-surface-subtle); padding:10px; border-radius:8px; border:1px solid var(--border-subtle);">
              <div style="font-size:10px; color:var(--text-muted);">Phosphorus (P)</div>
              <div style="font-size:16px; font-weight:700; color:#34d399;">Optimal (34 ppm)</div>
            </div>
            <div style="background:var(--bg-surface-subtle); padding:10px; border-radius:8px; border:1px solid var(--border-subtle);">
              <div style="font-size:10px; color:var(--text-muted);">Potassium (K)</div>
              <div style="font-size:16px; font-weight:700; color:#fbbf24;">Moderate (45 ppm)</div>
            </div>
          </div>
        </div>

        <div style="background:var(--bg-card-hover); padding:14px; border-radius:8px; border:1px solid var(--border-medium);">
          <h4 style="font-size:13px; color:#34d399; margin-bottom:6px;">AI Recommended Fertigation Recipe:</h4>
          <ul style="padding-left:18px; font-size:12px; color:var(--text-primary); display:flex; flex-direction:column; gap:4px;">
            <li>Apply <strong>Urea (46-0-0)</strong> at 15 kg/acre or Calcium Nitrate via drip line.</li>
            <li>Schedule fertigation injection during evening irrigation cycle.</li>
            <li>Maintain root-zone soil pH at <strong>6.5 – 6.8</strong> for optimal uptake.</li>
          </ul>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline btn-sm" onclick="modalManager.close()">Dismiss</button>
      <button class="btn btn-primary btn-sm" onclick="modalManager.applyFertigation()">✓ Schedule Fertigation</button>
    `;

    this.open(title, body, footer);
  }

  /**
   * 3. Disease Detection & AI Treatment Modal
   */
  openDiseaseModal() {
    const title = `<span style="color:var(--status-danger)">🔬</span> Disease Detection & AI Treatment Protocol`;
    const body = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); padding:14px; border-radius:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#f87171; font-size:15px;">Leaf Blight (Alternaria / Xanthomonas)</strong>
            <span class="badge badge-danger">HIGH RISK (72%)</span>
          </div>
          <p style="font-size:12px; color:#cbd5e1; margin-top:6px;">
            Identified by Edge-AI vision camera in <strong>Zone 2 (Chilli)</strong> and early onset in <strong>Zone 4</strong>. High humidity (78%) accelerates fungal spore propagation.
          </p>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <h4 style="font-size:13px; color:#fff;">Prescribed AI Action Plan</h4>
          <div style="background:var(--bg-surface-subtle); padding:12px 14px; border-radius:8px; border:1px solid var(--border-subtle); font-size:12px; display:flex; flex-direction:column; gap:6px;">
            <div><strong>1. Foliar Spray:</strong> Copper Oxychloride 50 WP @ 2.5g/L or Mancozeb 75 WP @ 2.0g/L.</div>
            <div><strong>2. Timing:</strong> Early morning or late afternoon when winds are under 10 km/h.</div>
            <div><strong>3. Canopy Pruning:</strong> Remove severely infected lower leaves and safely dispose off-plot.</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px; font-size:12px; color:var(--text-secondary); background:var(--bg-card-hover); padding:10px; border-radius:6px;">
          <input type="checkbox" id="isolateZoneCheck" checked />
          <label for="isolateZoneCheck">Mark Zone 2 for quarantine inspection before drone re-scan</label>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline btn-sm" onclick="modalManager.close()">Close</button>
      <button class="btn btn-primary btn-sm" style="background:#ef4444; border-color:#ef4444;" onclick="modalManager.markTreatmentApplied()">Record Treatment Applied</button>
    `;

    this.open(title, body, footer);
  }

  /**
   * 4. Irrigation Schedule Modal
   */
  openIrrigationModal() {
    const title = `<span style="color:var(--status-water)">💧</span> Precision Irrigation Advisory & Valve Control`;
    const body = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="background:rgba(14,165,233,0.08); border:1px solid rgba(14,165,233,0.25); padding:14px; border-radius:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#38bdf8; font-size:14px;">Irrigation Required for Zone 2 & Zone 4</strong>
            <span class="badge badge-water">18 mm Deficit</span>
          </div>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:6px;">
            Target Soil Moisture: <strong>45% – 50%</strong> | Current Average: <strong>28%</strong>.
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
          <div style="background:var(--bg-surface-subtle); padding:10px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-size:11px; color:var(--text-muted);">Recommended Timing</div>
            <div style="font-size:14px; font-weight:700; color:#fff;">Today Evening (5:30 PM)</div>
          </div>
          <div style="background:var(--bg-surface-subtle); padding:10px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-size:11px; color:var(--text-muted);">Estimated Water Volume</div>
            <div style="font-size:14px; font-weight:700; color:#fff;">650 Litres</div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <label style="font-size:12px; font-weight:600; color:var(--text-secondary);">Select Irrigation Sector:</label>
          <select id="irrigationSectorSelect" style="background:var(--bg-input); border:1px solid var(--border-medium); color:#fff; padding:8px 12px; border-radius:6px; font-size:13px;">
            <option value="both">All Deficit Zones (Zone 2 & Zone 4)</option>
            <option value="z2">Zone 2 Only (Chilli - 3.1 Acres)</option>
            <option value="z4">Zone 4 Only (Brinjal - 2.8 Acres)</option>
          </select>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline btn-sm" onclick="modalManager.close()">Cancel</button>
      <button class="btn btn-primary btn-sm" onclick="modalManager.triggerSmartValve()">🚀 Trigger Smart Valve</button>
    `;

    this.open(title, body, footer);
  }

  /**
   * 5. Edge-AI & FastAPI Connection Settings Modal
   */
  openApiConfigModal() {
    const currentUrl = window.apiService.getApiBaseUrl();
    const isConn = window.apiService.isConnected;

    const title = `⚙️ Edge-AI & FastAPI Backend Configuration`;
    const body = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <p style="font-size:12px; color:var(--text-secondary);">
          Connect FarmXpert directly to your <strong>VS Code Python Edge-AI FastAPI backend</strong> or run the standalone server.
        </p>

        <div style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-size:12px; font-weight:700; color:#fff;">API Base URL:</label>
          <div style="display:flex; gap:8px;">
            <input 
              type="text" 
              id="apiUrlInput" 
              value="${currentUrl}" 
              style="flex:1; background:var(--bg-input); border:1px solid var(--border-medium); color:#fff; padding:8px 12px; border-radius:6px; font-family:var(--font-mono); font-size:12px;" 
            />
            <button class="btn btn-primary btn-sm" id="testApiBtn" onclick="modalManager.testApiConnection()">Test & Save</button>
          </div>
          <span style="font-size:11px; color:var(--text-muted);">Default: http://localhost:8000/api/v1</span>
        </div>

        <div id="apiTestStatus" style="font-size:12px; padding:8px 12px; border-radius:6px; background:var(--bg-surface-subtle); border:1px solid var(--border-subtle);">
          Status: <strong>${isConn ? '<span style="color:#34d399;">Connected to Edge-AI</span>' : '<span style="color:#fbbf24;">Simulated Live Mock Stream Active</span>'}</strong>
        </div>

        <div style="background:var(--bg-surface-subtle); padding:12px; border-radius:8px; border:1px solid var(--border-subtle); font-size:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-weight:700; color:#fff;">Run Local Edge-AI FastAPI Server:</span>
            <a href="farmxpert-dashboard.zip" download="farmxpert-dashboard.zip" class="btn btn-primary btn-sm" style="font-size:11px; padding:3px 8px;">📦 Download .ZIP</a>
          </div>
          <pre style="background:#080c10; padding:8px; border-radius:4px; color:#38bdf8; font-family:var(--font-mono); font-size:11px; overflow-x:auto;">cd backend
pip install -r requirements.txt
python edge_ai_server.py</pre>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline btn-sm" onclick="modalManager.close()">Close</button>
    `;

    this.open(title, body, footer);
  }

  /**
   * 6. All Alerts Modal
   */
  openAllAlertsModal() {
    const alerts = window.FARMXPERT_DEFAULT_DATA.alerts;
    const title = `🚨 Active Farm Alerts & Risk Stream (${alerts.length})`;
    const body = `
      <div class="alerts-list">
        ${alerts.map(a => `
          <div class="alert-item alert-${a.type}">
            <div class="alert-item-icon">⚠️</div>
            <div class="alert-item-content">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div class="alert-item-title">${a.title}</div>
                <span class="badge ${a.type === 'danger' ? 'badge-danger' : 'badge-warning'}">${a.status}</span>
              </div>
              <div class="alert-item-desc">${a.description}</div>
              <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:11px; color:var(--text-muted);">
                <span>${a.zone} • ${a.time}</span>
                <span style="color:var(--primary); font-weight:600;">Action: ${a.action}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const footer = `
      <button class="btn btn-outline btn-sm" onclick="modalManager.close()">Close</button>
      <button class="btn btn-primary btn-sm" onclick="modalManager.showToast('All alerts marked acknowledged'); modalManager.close();">Acknowledge All</button>
    `;

    this.open(title, body, footer);
  }

  /**
   * 7. All Recommendations Modal
   */
  openAllRecsModal() {
    const recs = window.FARMXPERT_DEFAULT_DATA.ai_recommendations;
    const title = `🤖 FarmXpert AI Decision Engine Recommendations`;
    const body = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${recs.map(r => `
          <div class="rec-item" style="padding:14px;">
            <div class="rec-left">
              <div class="rec-num">${r.number}</div>
              <div>
                <div class="rec-text" style="font-weight:700;">${r.text}</div>
                <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Target: ${r.target} • ${r.detail}</div>
              </div>
            </div>
            <button class="rec-action-btn" onclick="modalManager.showToast('Executing: ${r.text.replace(/'/g, "")}'); modalManager.close();">Apply</button>
          </div>
        `).join('')}
      </div>
    `;

    const footer = `
      <button class="btn btn-outline btn-sm" onclick="modalManager.close()">Close</button>
    `;

    this.open(title, body, footer);
  }

  /**
   * 8. Farm Switcher Modal
   */
  openFarmSwitcherModal() {
    const title = `🏡 Select Farm Property`;
    const body = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="background:var(--bg-card-hover); border:1px solid var(--primary); padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
          <div>
            <div style="font-weight:700; color:#fff;">Green Valley Farm (Active)</div>
            <div style="font-size:11px; color:var(--text-muted);">12.5 Acres • Tomato, Chilli, Brinjal</div>
          </div>
          <span class="badge badge-healthy">SELECTED</span>
        </div>

        <div style="background:var(--bg-surface-subtle); border:1px solid var(--border-subtle); padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="modalManager.showToast('Switched to Sunrise Organic Estate'); modalManager.close();">
          <div>
            <div style="font-weight:700; color:#fff;">Sunrise Organic Estate</div>
            <div style="font-size:11px; color:var(--text-muted);">24.0 Acres • Cotton, Maize, Soy</div>
          </div>
          <span class="btn btn-outline btn-sm">Switch</span>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline btn-sm" onclick="modalManager.close()">Close</button>
    `;

    this.open(title, body, footer);
  }

  // Interactive Action Handlers
  async testApiConnection() {
    const input = document.getElementById('apiUrlInput');
    const statusDiv = document.getElementById('apiTestStatus');
    if (!input || !statusDiv) return;

    statusDiv.innerHTML = `<span style="color:#94a3b8;">Testing connection to ${input.value}...</span>`;
    const res = await window.apiService.setApiBaseUrl(input.value);

    if (res.success) {
      statusDiv.innerHTML = `<span style="color:#34d399; font-weight:700;">✓ ${res.message}</span>`;
      this.showToast('Backend connected successfully!', 'success');
    } else {
      statusDiv.innerHTML = `<span style="color:#fbbf24; font-weight:700;">ℹ️ ${res.message}</span>`;
      this.showToast('Using local real-time simulator', 'info');
    }
  }

  triggerIrrigation(zoneName) {
    this.close();
    this.showToast(`💧 Automated drip irrigation triggered for ${zoneName}!`, 'info');
  }

  triggerSmartValve() {
    this.close();
    this.showToast('🚀 Smart Valve opened: 18mm drip cycle initiated for Zone 2 & 4.', 'success');
  }

  applyFertigation() {
    this.close();
    this.showToast('🌿 Nitrogen fertigation injection queued for evening cycle.', 'success');
  }

  markTreatmentApplied() {
    this.close();
    this.showToast('🛡️ Fungicide spray logged. Zone 2 placed in monitoring mode.', 'success');
  }
}

window.modalManager = new FarmModalManager();
