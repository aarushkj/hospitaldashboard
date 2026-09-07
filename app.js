/* ============================================
   NURSE COMMAND STATION — Application Logic
   AI-Powered Smart Hospital Room
   ============================================ */

// ─── Patient Data Model ────────────────────────────
const PATIENTS = [
    {
        id: 1, room: '101', bed: 'A',
        name: 'Abhibnand', age: 45, gender: 'M',
        diagnosis: 'Acute Myocardial Infarction',
        admitDate: '2026-08-30', dayOfAdmission: 4,
        attendingDr: 'Dr. Kapoor', primaryNurse: 'Nurse Meera',
        baselines: { hr: 74, spo2: 98, temp: 35.8, respRate: 16, systolicBp: 125 },
        consciousness: 'A', supplementalO2: false,
        spo2Scale: 1
    },
    {
        id: 2, room: '102', bed: 'A',
        name: 'Priya Reddy', age: 58, gender: 'F',
        diagnosis: 'COPD Exacerbation',
        admitDate: '2026-08-28', dayOfAdmission: 6,
        attendingDr: 'Dr. Rao', primaryNurse: 'Nurse Priya',
        baselines: { hr: 105, spo2: 93, temp: 37.8, respRate: 22, systolicBp: 115 },
        consciousness: 'A', supplementalO2: false,
        spo2Scale: 1
    },
    {
        id: 3, room: '103', bed: 'B',
        name: 'Rajesh Kumar', age: 67, gender: 'M',
        diagnosis: 'Community-Acquired Pneumonia',
        admitDate: '2026-08-31', dayOfAdmission: 3,
        attendingDr: 'Dr. Patel', primaryNurse: 'Nurse Anjali',
        baselines: { hr: 115, spo2: 94, temp: 39.2, respRate: 22, systolicBp: 105 },
        consciousness: 'A', supplementalO2: false,
        spo2Scale: 1
    },
    {
        id: 4, room: '104', bed: 'A',
        name: 'Anita Desai', age: 34, gender: 'F',
        diagnosis: 'Post-Appendectomy (Day 1)',
        admitDate: '2026-09-01', dayOfAdmission: 2,
        attendingDr: 'Dr. Shah', primaryNurse: 'Nurse Priya',
        baselines: { hr: 68, spo2: 99, temp: 36.5, respRate: 14, systolicBp: 118 },
        consciousness: 'A', supplementalO2: false,
        spo2Scale: 1
    },
    {
        id: 5, room: '105', bed: 'A',
        name: 'Mohammed Farooq', age: 71, gender: 'M',
        diagnosis: 'Diabetic Ketoacidosis',
        admitDate: '2026-08-31', dayOfAdmission: 3,
        attendingDr: 'Dr. Iyer', primaryNurse: 'Nurse Meera',
        baselines: { hr: 95, spo2: 94, temp: 38.5, respRate: 22, systolicBp: 105 },
        consciousness: 'A', supplementalO2: false,
        spo2Scale: 1
    },
    {
        id: 6, room: '106', bed: 'A',
        name: 'Lakshmi Iyer', age: 52, gender: 'F',
        diagnosis: 'Hypertensive Crisis',
        admitDate: '2026-08-29', dayOfAdmission: 5,
        attendingDr: 'Dr. Menon', primaryNurse: 'Nurse Priya',
        baselines: { hr: 88, spo2: 97, temp: 38.5, respRate: 18, systolicBp: 95 },
        consciousness: 'A', supplementalO2: false,
        spo2Scale: 1
    },
    {
        id: 7, room: '107', bed: 'A',
        name: 'Vikram Singh', age: 63, gender: 'M',
        diagnosis: 'Atrial Fibrillation',
        admitDate: '2026-08-31', dayOfAdmission: 3,
        attendingDr: 'Dr. Kapoor', primaryNurse: 'Nurse Anjali',
        baselines: { hr: 95, spo2: 97, temp: 36.0, respRate: 16, systolicBp: 125 },
        consciousness: 'A', supplementalO2: false,
        spo2Scale: 1
    },
    {
        id: 8, room: '108', bed: 'A',
        name: 'Deepa Nair', age: 29, gender: 'F',
        diagnosis: 'Severe Asthma Exacerbation',
        admitDate: '2026-09-01', dayOfAdmission: 2,
        attendingDr: 'Dr. Rao', primaryNurse: 'Nurse Meera',
        baselines: { hr: 92, spo2: 95, temp: 37.5, respRate: 22, systolicBp: 118 },
        consciousness: 'A', supplementalO2: false,
        spo2Scale: 1
    },
    {
        id: 9, room: '109', bed: 'A',
        name: 'Suresh Menon', age: 78, gender: 'M',
        diagnosis: 'Hip Fracture (Post-Op Day 6)',
        admitDate: '2026-08-27', dayOfAdmission: 7,
        attendingDr: 'Dr. Shah', primaryNurse: 'Nurse Anjali',
        baselines: { hr: 65, spo2: 97, temp: 35.8, respRate: 14, systolicBp: 130 },
        consciousness: 'A', supplementalO2: false,
        spo2Scale: 1
    },
    {
        id: 10, room: '110', bed: 'A',
        name: 'Kavita Joshi', age: 41, gender: 'F',
        diagnosis: 'Acute Pancreatitis',
        admitDate: '2026-08-30', dayOfAdmission: 4,
        attendingDr: 'Dr. Iyer', primaryNurse: 'Nurse Priya',
        baselines: { hr: 82, spo2: 96, temp: 37.8, respRate: 10, systolicBp: 105 },
        consciousness: 'A', supplementalO2: false,
        spo2Scale: 1
    },
    {
        id: 11, room: '111', bed: 'A',
        name: 'Ravi Krishnan', age: 55, gender: 'M',
        diagnosis: 'Sepsis (Recovering)',
        admitDate: '2026-08-26', dayOfAdmission: 8,
        attendingDr: 'Dr. Patel', primaryNurse: 'Nurse Meera',
        baselines: { hr: 108, spo2: 95, temp: 38.2, respRate: 21, systolicBp: 115 },
        consciousness: 'A', supplementalO2: false,
        spo2Scale: 1
    },
    {
        id: 12, room: '112', bed: 'A',
        name: 'Fatima Begum', age: 68, gender: 'F',
        diagnosis: 'Ischemic Stroke',
        admitDate: '2026-08-29', dayOfAdmission: 5,
        attendingDr: 'Dr. Menon', primaryNurse: 'Nurse Anjali',
        baselines: { hr: 48, spo2: 96, temp: 37.0, respRate: 16, systolicBp: 130 },
        consciousness: 'A', supplementalO2: true,
        spo2Scale: 1
    }
];

// ─── Nurse Calls ────────────────────────────────────
const NURSE_CALLS = [
    {
        id: 'nc-1', roomId: '102', patientName: 'Priya Reddy',
        type: 'clinical', message: 'Requesting pain assessment — discomfort in chest area',
        createdAt: Date.now() - 225000, // ~3:45 ago
        status: 'pending'
    },
    {
        id: 'nc-2', roomId: '106', patientName: 'Lakshmi Iyer',
        type: 'comfort', message: 'Water and blanket request',
        createdAt: Date.now() - 82000, // ~1:22 ago
        status: 'pending'
    },
    {
        id: 'nc-3', roomId: '109', patientName: 'Suresh Menon',
        type: 'comfort', message: 'Requesting help adjusting bed position',
        createdAt: Date.now() - 30000, // ~0:30 ago
        status: 'pending'
    }
];

// ─── State ──────────────────────────────────────────
const state = {
    patients: window.SmartHospitalStore ? window.SmartHospitalStore.getPatients() : [],
    nurseCalls: window.SmartHospitalStore ? window.SmartHospitalStore.getNurseCalls() : [...NURSE_CALLS],
    activeFilter: 'all',
    searchQuery: '',
    selectedPatient: null,
    soundEnabled: true,
    callsResolvedToday: 14
};

// ─── NEWS2 Calculator ──────────────────────────────
function calculateNEWS2(vitals, consciousness, supplementalO2, spo2Scale = 1) {
    const scores = {};

    // Respiratory Rate
    const rr = vitals.respRate;
    if (rr <= 8) scores.respRate = 3;
    else if (rr <= 11) scores.respRate = 1;
    else if (rr <= 20) scores.respRate = 0;
    else if (rr <= 24) scores.respRate = 2;
    else scores.respRate = 3;

    // SpO2 Scale 1
    const spo2 = vitals.spo2;
    if (spo2Scale === 1) {
        if (spo2 <= 91) scores.spo2 = 3;
        else if (spo2 <= 93) scores.spo2 = 2;
        else if (spo2 <= 95) scores.spo2 = 1;
        else scores.spo2 = 0;
    } else {
        if (spo2 <= 83) scores.spo2 = 3;
        else if (spo2 <= 85) scores.spo2 = 2;
        else if (spo2 <= 87) scores.spo2 = 1;
        else if (spo2 <= 92 && !supplementalO2) scores.spo2 = 0;
        else if (spo2 <= 94 && supplementalO2) scores.spo2 = 1;
        else if (spo2 <= 96 && supplementalO2) scores.spo2 = 2;
        else if (spo2 >= 97 && supplementalO2) scores.spo2 = 3;
        else scores.spo2 = 0;
    }

    // Supplemental O2
    scores.supplementalO2 = supplementalO2 ? 2 : 0;

    // Systolic BP
    const sbp = vitals.systolicBp;
    if (sbp <= 90) scores.systolicBp = 3;
    else if (sbp <= 100) scores.systolicBp = 2;
    else if (sbp <= 110) scores.systolicBp = 1;
    else if (sbp <= 219) scores.systolicBp = 0;
    else scores.systolicBp = 3;

    // Heart Rate
    const hr = vitals.hr;
    if (hr <= 40) scores.hr = 3;
    else if (hr <= 50) scores.hr = 1;
    else if (hr <= 90) scores.hr = 0;
    else if (hr <= 110) scores.hr = 1;
    else if (hr <= 130) scores.hr = 2;
    else scores.hr = 3;

    // Temperature
    const temp = vitals.temp;
    if (temp <= 35.0) scores.temperature = 3;
    else if (temp <= 36.0) scores.temperature = 1;
    else if (temp <= 38.0) scores.temperature = 0;
    else if (temp <= 39.0) scores.temperature = 1;
    else scores.temperature = 2;

    // Consciousness
    scores.consciousness = consciousness === 'A' ? 0 : 3;

    // Aggregate
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const singleParam3 = Object.values(scores).some(v => v === 3);

    let riskLevel;
    if (total >= 7) riskLevel = 'high';
    else if (total >= 5) riskLevel = 'medium';
    else if (singleParam3) riskLevel = 'low-medium';
    else riskLevel = 'low';

    return { total, scores, riskLevel, singleParam3 };
}

// ─── Risk Level Helpers ─────────────────────────────
function getRiskDescription(risk) {
    const map = {
        'low': 'Routine monitoring',
        'low-medium': 'Urgent ward review',
        'medium': 'Urgent doctor review',
        'high': 'Emergency assessment required'
    };
    return map[risk] || '';
}

function getRiskClass(risk) {
    return `risk-${risk}`;
}

function getVitalStatus(paramName, score) {
    if (score >= 3) return 'danger';
    if (score >= 1) return 'warning';
    return '';
}

// ─── Simulation Engine ─────────────────────────────
function initPatients() {
    if (window.SmartHospitalStore) {
        state.patients = window.SmartHospitalStore.getPatients();
        state.nurseCalls = window.SmartHospitalStore.getNurseCalls();
    } else {
        state.patients = PATIENTS.map(p => {
            const vitals = { ...p.baselines };
            const history = {
                hr: Array.from({ length: 20 }, () => vitals.hr + (Math.random() - 0.5) * 6),
                spo2: Array.from({ length: 20 }, () => Math.min(100, Math.max(85, vitals.spo2 + (Math.random() - 0.5) * 3))),
                temp: Array.from({ length: 20 }, () => vitals.temp + (Math.random() - 0.5) * 0.4)
            };
            const news2 = calculateNEWS2(vitals, p.consciousness, p.supplementalO2, p.spo2Scale);
            return { ...p, vitals, history, news2 };
        });
    }
}

function simulateVitals() {
    const batchUpdates = {};

    state.patients.forEach(p => {
        const base = p.baselines || p.vitals;
        const jitter = (range) => (Math.random() - 0.5) * 2 * range;

        const newHr = Math.round(clamp(
            p.vitals.hr + jitter(2) + (base.hr - p.vitals.hr) * 0.05,
            30, 180
        ));
        const newSpo2 = Math.round(clamp(
            p.vitals.spo2 + jitter(0.8) + (base.spo2 - p.vitals.spo2) * 0.08,
            80, 100
        ));
        const newTemp = parseFloat(clamp(
            p.vitals.temp + jitter(0.08) + (base.temp - p.vitals.temp) * 0.05,
            34.0, 42.0
        ).toFixed(1));

        p.vitals.hr = newHr;
        p.vitals.spo2 = newSpo2;
        p.vitals.temp = newTemp;

        batchUpdates[p.room] = { hr: newHr, spo2: newSpo2, temp: newTemp };

        p.history.hr.push(p.vitals.hr);
        p.history.spo2.push(p.vitals.spo2);
        p.history.temp.push(p.vitals.temp);
        if (p.history.hr.length > 30) p.history.hr.shift();
        if (p.history.spo2.length > 30) p.history.spo2.shift();
        if (p.history.temp.length > 30) p.history.temp.shift();

        p.news2 = calculateNEWS2(p.vitals, p.consciousness, p.supplementalO2, p.spo2Scale);
    });

    if (window.SmartHospitalStore) {
        window.SmartHospitalStore.batchUpdateVitals(batchUpdates);
    }
}

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

// ─── Sparkline SVG Generator ───────────────────────
function generateSparkline(data, color = '#00b4d8', height = 28, width = 200) {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const h = height - padding * 2;
    const step = width / (data.length - 1);

    const points = data.map((v, i) =>
        `${(i * step).toFixed(1)},${(padding + h - ((v - min) / range) * h).toFixed(1)}`
    ).join(' ');

    const lastX = ((data.length - 1) * step).toFixed(1);
    const lastY = (padding + h - ((data[data.length - 1] - min) / range) * h).toFixed(1);

    // Gradient fill
    const fillPoints = `0,${height} ${points} ${lastX},${height}`;

    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <defs>
            <linearGradient id="grad-${color.replace('#', '')}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <polygon points="${fillPoints}" fill="url(#grad-${color.replace('#', '')})" />
        <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${lastX}" cy="${lastY}" r="2" fill="${color}" />
    </svg>`;
}

// ─── Render Functions ──────────────────────────────

function renderHeaderStats() {
    const el = document.getElementById('header-stats');
    const total = state.patients.length;
    const high = state.patients.filter(p => p.news2.riskLevel === 'high').length;
    const medium = state.patients.filter(p => p.news2.riskLevel === 'medium').length;
    const lowMed = state.patients.filter(p => p.news2.riskLevel === 'low-medium').length;
    const low = state.patients.filter(p => p.news2.riskLevel === 'low').length;
    const pendingCalls = state.nurseCalls.filter(c => c.status === 'pending').length;

    el.innerHTML = `
        <div class="stat-chip info">
            <span>Patients</span>
            <span class="stat-value">${total}</span>
        </div>
        <div class="stat-chip critical">
            <span>🔴 High</span>
            <span class="stat-value">${high}</span>
        </div>
        <div class="stat-chip warning">
            <span>🟡 Medium</span>
            <span class="stat-value">${medium + lowMed}</span>
        </div>
        <div class="stat-chip ok">
            <span>🟢 Low</span>
            <span class="stat-value">${low}</span>
        </div>
        <div class="stat-chip ${pendingCalls > 0 ? 'warning' : 'info'}">
            <span>📞 Calls</span>
            <span class="stat-value">${pendingCalls}</span>
        </div>
    `;
}

function renderAlertsBanner() {
    const highRisk = state.patients.filter(p => p.news2.riskLevel === 'high');
    const banner = document.getElementById('alerts-banner');
    const countEl = document.getElementById('alert-count');
    const listEl = document.getElementById('alerts-list');

    if (highRisk.length === 0) {
        banner.style.display = 'none';
        return;
    }

    banner.style.display = 'block';
    countEl.textContent = highRisk.length;

    listEl.innerHTML = highRisk.map(p => {
        const hrStatus = p.news2.scores.hr >= 2 ? 'vital-danger' : p.news2.scores.hr >= 1 ? 'vital-warning' : '';
        const spo2Status = p.news2.scores.spo2 >= 2 ? 'vital-danger' : p.news2.scores.spo2 >= 1 ? 'vital-warning' : '';
        const tempStatus = p.news2.scores.temperature >= 2 ? 'vital-danger' : p.news2.scores.temperature >= 1 ? 'vital-warning' : '';
        const bpStatus = p.news2.scores.systolicBp >= 2 ? 'vital-danger' : p.news2.scores.systolicBp >= 1 ? 'vital-warning' : '';

        return `
        <div class="alert-card">
            <div class="alert-card-left">
                <div class="alert-card-room">Room ${p.room} Bed ${p.bed} — NEWS: ${p.news2.total} — ${getRiskDescription(p.news2.riskLevel)}</div>
                <div class="alert-card-details">${p.name}, ${p.age}${p.gender} — ${p.diagnosis}</div>
                <div class="alert-card-vitals">
                    <span class="${hrStatus}">HR: ${p.vitals.hr} bpm</span>
                    <span class="${spo2Status}">SpO₂: ${p.vitals.spo2}%</span>
                    <span class="${tempStatus}">Temp: ${p.vitals.temp}°C</span>
                    <span class="${bpStatus}">BP: ${p.vitals.systolicBp} mmHg</span>
                </div>
            </div>
            <div class="alert-card-actions">
                <button class="btn btn-danger" onclick="acknowledgeAlert(${p.id})">ACKNOWLEDGE</button>
                <button class="btn btn-outline" onclick="openPatientModal(${p.id})">VIEW PATIENT</button>
                <button class="btn btn-outline">CALL DOCTOR</button>
            </div>
        </div>`;
    }).join('');
}

function renderWardGrid() {
    const grid = document.getElementById('ward-grid');
    const filtered = getFilteredPatients();

    grid.innerHTML = filtered.map(p => {
        const hrStatus = getVitalStatus('hr', p.news2.scores.hr);
        const spo2Status = getVitalStatus('spo2', p.news2.scores.spo2);
        const tempStatus = getVitalStatus('temperature', p.news2.scores.temperature);
        const riskClass = getRiskClass(p.news2.riskLevel);
        const hasCall = state.nurseCalls.some(c => c.roomId === p.room && c.status === 'pending');

        const sparkColor = p.news2.riskLevel === 'high' ? '#ef4444'
            : p.news2.riskLevel === 'medium' ? '#f59e0b'
            : '#00b4d8';

        return `
        <div class="room-card ${riskClass}" data-patient-id="${p.id}" onclick="openPatientModal(${p.id})">
            <div class="room-card-header">
                <span class="room-id">Room ${p.room} · Bed ${p.bed}</span>
                <span class="news2-badge ${p.news2.riskLevel}">
                    NEWS ${p.news2.total}
                </span>
            </div>
            <div class="patient-name">${p.name}</div>
            <div class="patient-meta">${p.age}${p.gender} · ${p.diagnosis} · Day ${p.dayOfAdmission}</div>
            <div class="vitals-row">
                <div class="vital-item ${hrStatus}">
                    <span class="vital-label">HR</span>
                    <span class="vital-value" data-vital="hr-${p.id}">${p.vitals.hr}</span>
                    <span class="vital-unit">bpm</span>
                </div>
                <div class="vital-item ${spo2Status}">
                    <span class="vital-label">SpO₂</span>
                    <span class="vital-value" data-vital="spo2-${p.id}">${p.vitals.spo2}%</span>
                    <span class="vital-unit">&nbsp;</span>
                </div>
                <div class="vital-item ${tempStatus}">
                    <span class="vital-label">Temp</span>
                    <span class="vital-value" data-vital="temp-${p.id}">${p.vitals.temp}°</span>
                    <span class="vital-unit">°C</span>
                </div>
            </div>
            <div class="sparkline-container">
                ${generateSparkline(p.history.hr, sparkColor)}
            </div>
            <div class="room-card-footer">
                ${hasCall ? '<span class="card-tag nurse-call">📞 Nurse Call</span>' : ''}
                ${p.supplementalO2 ? '<span class="card-tag o2">O₂</span>' : ''}
                ${!hasCall && !p.supplementalO2 ? `<span class="card-tag">${p.attendingDr}</span>` : ''}
                <span class="card-time">${formatTime(new Date())}</span>
            </div>
        </div>`;
    }).join('');
}

function renderNurseCalls() {
    const list = document.getElementById('calls-list');
    const countEl = document.getElementById('call-count');
    const pending = state.nurseCalls.filter(c => c.status === 'pending');
    countEl.textContent = pending.length;

    if (pending.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                <p>No pending calls</p>
            </div>`;
        document.getElementById('avg-response-time').textContent = '—';
        return;
    }

    // Compute average wait time
    const avgMs = pending.reduce((sum, c) => sum + (Date.now() - c.createdAt), 0) / pending.length;
    document.getElementById('avg-response-time').textContent = formatDuration(avgMs);

    list.innerHTML = pending
        .sort((a, b) => a.createdAt - b.createdAt) // oldest first
        .map(call => {
            const elapsed = Date.now() - call.createdAt;
            const elapsedMin = elapsed / 60000;
            let timerClass = 'ok';
            if (call.type === 'emergency' && elapsedMin > 2) timerClass = 'overdue';
            else if (call.type === 'clinical' && elapsedMin > 5) timerClass = 'overdue';
            else if (call.type === 'clinical' && elapsedMin > 3) timerClass = 'warning';
            else if (call.type === 'comfort' && elapsedMin > 15) timerClass = 'overdue';
            else if (call.type === 'comfort' && elapsedMin > 10) timerClass = 'warning';
            else if (elapsedMin > 2) timerClass = 'warning';

            return `
            <div class="call-card ${call.type}">
                <div class="call-card-top">
                    <span class="call-room">Room ${call.roomId} — ${call.patientName}</span>
                    <span class="call-timer ${timerClass}">
                        <span class="timer-dot"></span>
                        ${formatDuration(elapsed)}
                    </span>
                </div>
                <span class="call-type-tag ${call.type}">${call.type}</span>
                <div class="call-message">${call.message}</div>
                <div class="call-actions">
                    <button class="btn btn-primary" onclick="respondToCall('${call.id}')">RESPOND</button>
                    <button class="btn btn-outline" onclick="dismissCall('${call.id}')">DISMISS</button>
                </div>
            </div>`;
        }).join('');
}

function renderAll() {
    renderHeaderStats();
    renderAlertsBanner();
    renderWardGrid();
    renderNurseCalls();
}

// ─── Patient Modal ─────────────────────────────────

function openPatientModal(patientId) {
    const p = state.patients.find(pt => pt.id === patientId);
    if (!p) return;
    state.selectedPatient = p;

    const overlay = document.getElementById('modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    titleEl.innerHTML = `
        <span class="room-label">Room ${p.room} · Bed ${p.bed}</span>
        <span class="patient-label">${p.name}</span>
    `;

    const riskClass = p.news2.riskLevel;

    const vitalCards = [
        { label: 'Heart Rate', value: p.vitals.hr, unit: 'bpm', score: p.news2.scores.hr, key: 'hr' },
        { label: 'SpO₂', value: `${p.vitals.spo2}`, unit: '%', score: p.news2.scores.spo2, key: 'spo2' },
        { label: 'Temperature', value: p.vitals.temp, unit: '°C', score: p.news2.scores.temperature, key: 'temp' },
        { label: 'Resp Rate', value: p.vitals.respRate, unit: '/min', score: p.news2.scores.respRate, key: 'respRate' },
        { label: 'Systolic BP', value: p.vitals.systolicBp, unit: 'mmHg', score: p.news2.scores.systolicBp, key: 'systolicBp' },
        { label: 'Consciousness', value: p.consciousness === 'A' ? 'Alert' : 'CVPU', unit: '', score: p.news2.scores.consciousness, key: 'consciousness' },
    ];

    if (p.supplementalO2) {
        vitalCards.push({ label: 'Suppl. O₂', value: 'Yes', unit: '+2 pts', score: 2, key: 'o2' });
    }

    const sparkColorsModal = {
        hr: '#ef4444',
        spo2: '#00b4d8',
        temp: '#f59e0b'
    };

    bodyEl.innerHTML = `
        <div class="modal-section">
            <div class="news2-summary">
                <span class="news2-score-large ${riskClass}">${p.news2.total}</span>
                <div class="news2-details">
                    <div class="risk-label" style="color: var(--status-${riskClass === 'low-medium' ? 'low-medium' : riskClass})">${p.news2.riskLevel.toUpperCase()} RISK</div>
                    <div class="risk-desc">${getRiskDescription(p.news2.riskLevel)}</div>
                    <div class="risk-desc" style="margin-top:4px; color: var(--text-tertiary);">${p.diagnosis} · Day ${p.dayOfAdmission} · ${p.attendingDr}</div>
                </div>
            </div>
        </div>

        <div class="modal-section">
            <div class="modal-section-title">Current Vitals & NEWS2 Breakdown</div>
            <div class="modal-vitals-grid">
                ${vitalCards.map(v => `
                    <div class="modal-vital-card ${v.score >= 3 ? 'score-high' : v.score >= 2 ? 'score-medium' : ''}">
                        <div class="m-vital-label">${v.label}</div>
                        <div class="m-vital-value" style="color: ${v.score >= 3 ? 'var(--status-high)' : v.score >= 2 ? 'var(--status-medium)' : v.score >= 1 ? 'var(--status-low-medium)' : 'var(--text-primary)'}">${v.value}</div>
                        <div class="m-vital-unit">${v.unit}</div>
                        <span class="m-vital-score score-${v.score}">Score: ${v.score}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="modal-section">
            <div class="modal-section-title">Vital Trends (Last 30 Readings)</div>
            ${['hr', 'spo2', 'temp'].map(key => {
                const labels = { hr: 'Heart Rate (bpm)', spo2: 'SpO₂ (%)', temp: 'Temperature (°C)' };
                return `
                <div style="margin-bottom: var(--space-sm);">
                    <div style="font-size: 0.72rem; color: var(--text-tertiary); margin-bottom: 4px;">${labels[key]}</div>
                    <div class="modal-sparkline">
                        ${generateSparkline(p.history[key], sparkColorsModal[key], 60, 700)}
                    </div>
                </div>`;
            }).join('')}
        </div>

        <div class="modal-section">
            <div class="modal-section-title">Recent Activity</div>
            <div class="timeline">
                ${generateTimeline(p)}
            </div>
        </div>
    `;

    overlay.classList.add('active');
}

function closePatientModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    state.selectedPatient = null;
}

function generateTimeline(patient) {
    const now = new Date();
    const events = [
        { time: new Date(now - 15 * 60000), text: `Vitals recorded — HR: ${patient.vitals.hr}, SpO₂: ${patient.vitals.spo2}%, Temp: ${patient.vitals.temp}°C`, type: '' },
        { time: new Date(now - 45 * 60000), text: `Medication administered — as per orders`, type: '' },
        { time: new Date(now - 2 * 3600000), text: `NEWS2 score: ${patient.news2.total} (${patient.news2.riskLevel.toUpperCase()})`, type: patient.news2.riskLevel === 'high' ? 'alert' : '' },
        { time: new Date(now - 4 * 3600000), text: `Morning assessment completed by ${patient.primaryNurse}`, type: '' },
        { time: new Date(now - 6 * 3600000), text: `Clinical note added by ${patient.attendingDr}`, type: 'order' },
        { time: new Date(now - 8 * 3600000), text: `Shift handoff — patient stable`, type: '' },
    ];

    return events.map(e => `
        <div class="timeline-item ${e.type}">
            <div class="timeline-time">${formatTime(e.time)}</div>
            <div class="timeline-text">${e.text}</div>
        </div>
    `).join('');
}

// ─── Nurse Call Actions ─────────────────────────────
function respondToCall(callId) {
    if (window.SmartHospitalStore) {
        window.SmartHospitalStore.acknowledgeNurseCall(callId, 'Nurse Priya');
    }
    const call = state.nurseCalls.find(c => c.id === callId);
    if (call) {
        call.status = 'responded';
        state.callsResolvedToday++;
        if (document.getElementById('calls-resolved')) {
            document.getElementById('calls-resolved').textContent = state.callsResolvedToday;
        }
        renderNurseCalls();
        renderWardGrid();
        renderHeaderStats();
    }
}

function dismissCall(callId) {
    if (window.SmartHospitalStore) {
        window.SmartHospitalStore.resolveNurseCall(callId);
    }
    state.nurseCalls = state.nurseCalls.filter(c => c.id !== callId);
    state.callsResolvedToday++;
    if (document.getElementById('calls-resolved')) {
        document.getElementById('calls-resolved').textContent = state.callsResolvedToday;
    }
    renderNurseCalls();
    renderWardGrid();
    renderHeaderStats();
}

function acknowledgeAlert(patientId) {
    // Visual feedback only — in real app this would update backend
    const cards = document.querySelectorAll(`[data-patient-id="${patientId}"]`);
    cards.forEach(c => {
        c.style.animation = 'none';
        c.offsetHeight; // reflow
        c.style.animation = '';
    });
}

// ─── Filtering & Search ─────────────────────────────
function getFilteredPatients() {
    let patients = [...state.patients];

    // Filter by risk
    if (state.activeFilter !== 'all') {
        if (state.activeFilter === 'high') {
            patients = patients.filter(p => p.news2.riskLevel === 'high');
        } else if (state.activeFilter === 'medium') {
            patients = patients.filter(p => p.news2.riskLevel === 'medium' || p.news2.riskLevel === 'low-medium');
        } else if (state.activeFilter === 'low') {
            patients = patients.filter(p => p.news2.riskLevel === 'low');
        }
    }

    // Search
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        patients = patients.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.room.includes(q) ||
            p.diagnosis.toLowerCase().includes(q)
        );
    }

    // Sort: high risk first
    patients.sort((a, b) => {
        const order = { high: 0, medium: 1, 'low-medium': 2, low: 3 };
        return (order[a.news2.riskLevel] ?? 4) - (order[b.news2.riskLevel] ?? 4);
    });

    return patients;
}

// ─── Utility ────────────────────────────────────────
function formatTime(date) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: false
    });
}

// ─── Event Listeners ────────────────────────────────
function setupEventListeners() {
    // Filter pills
    document.querySelectorAll('.filter-pills .pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.activeFilter = pill.dataset.filter;
            renderWardGrid();
        });
    });

    // Search
    document.getElementById('search-input').addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderWardGrid();
    });

    // Modal close
    document.getElementById('modal-close').addEventListener('click', closePatientModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closePatientModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePatientModal();
    });

    // Alert banner collapse
    document.getElementById('btn-collapse-alerts').addEventListener('click', () => {
        const list = document.getElementById('alerts-list');
        const btn = document.getElementById('btn-collapse-alerts');
        list.style.display = list.style.display === 'none' ? 'flex' : 'none';
        btn.style.transform = list.style.display === 'none' ? 'rotate(180deg)' : '';
    });

    // Fullscreen
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });

    // Sound toggle
    document.getElementById('btn-sound-toggle').addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        const btn = document.getElementById('btn-sound-toggle');
        btn.style.opacity = state.soundEnabled ? '1' : '0.4';
    });
}

// ─── Random Nurse Call Generator ────────────────────
function maybeGenerateNurseCall() {
    if (Math.random() > 0.03) return; // ~3% chance per tick (every 2s)

    const templates = [
        { type: 'comfort', messages: ['Water request', 'Blanket needed', 'Help with TV remote', 'Requesting pillow adjustment'] },
        { type: 'clinical', messages: ['Pain assessment needed', 'Feeling dizzy', 'Nausea — requesting medication', 'Requesting wound check'] },
    ];

    const category = templates[Math.random() > 0.4 ? 0 : 1];
    const message = category.messages[Math.floor(Math.random() * category.messages.length)];
    const availableRooms = state.patients.filter(p =>
        !state.nurseCalls.some(c => c.roomId === p.room && c.status === 'pending')
    );

    if (availableRooms.length === 0) return;

    const patient = availableRooms[Math.floor(Math.random() * availableRooms.length)];
    state.nurseCalls.push({
        id: `nc-${Date.now()}`,
        roomId: patient.room,
        patientName: patient.name,
        type: category.type,
        message,
        createdAt: Date.now(),
        status: 'pending'
    });
}

// ─── Initialization ─────────────────────────────────
function init() {
    initPatients();
    setupEventListeners();
    renderAll();
    updateClock();

    if (window.SmartHospitalStore) {
        window.SmartHospitalStore.subscribe((msg, newState) => {
            if (newState) {
                state.patients = newState.patients;
                state.nurseCalls = newState.nurseCalls || [];
                renderAll();
            }
        });
    }

    // Simulation loop: update vitals every 2 seconds
    setInterval(() => {
        simulateVitals();
        maybeGenerateNurseCall();
        renderAll();

        // Update modal if open
        if (state.selectedPatient) {
            const p = state.patients.find(pt => pt.id === state.selectedPatient.id);
            if (p) {
                state.selectedPatient = p;
                const modalBody = document.getElementById('modal-body');
                if (modalBody && document.getElementById('modal-overlay').classList.contains('active')) {
                    openPatientModal(p.id);
                }
            }
        }
    }, 2000);

    // Clock update every second
    setInterval(updateClock, 1000);

    // Nurse call timers update every second
    setInterval(() => {
        renderNurseCalls();
    }, 1000);
}

// Start
document.addEventListener('DOMContentLoaded', init);
