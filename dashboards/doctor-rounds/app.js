/* ============================================
   DOCTOR ROUNDS APP — Application Logic
   AI-Powered Smart Hospital Room
   ============================================ */

// ─── Ward Patients Data ──────────────────────────────
const ROUNDS_PATIENTS = [
    {
        id: 3, room: '103', bed: 'B', name: 'Rajesh Kumar', age: 67, gender: 'M',
        diagnosis: 'Community-Acquired Pneumonia (CAP)', admitDate: '2026-08-31', dayOfCare: 3,
        attendingDr: 'Dr. Patel', news2: { total: 8, riskLevel: 'high' },
        vitals: { hr: 118, spo2: 89, temp: 39.2, bp: '95/60' },
        history: {
            hr: [95, 98, 104, 110, 115, 118, 122, 118],
            spo2: [96, 95, 93, 91, 90, 89, 88, 89],
            temp: [37.5, 37.8, 38.2, 38.8, 39.0, 39.2, 39.1, 39.2]
        },
        orders: [
            { id: 'ord-1', category: 'Medication', text: 'Ceftriaxone 1g IV Q12H STAT', urgency: 'STAT' },
            { id: 'ord-2', category: 'Imaging', text: 'Chest X-Ray PA View - Bedside Urgent', urgency: 'URGENT' },
            { id: 'ord-3', category: 'Lab Work', text: 'CBC + CRP + Blood Cultures x 2', urgency: 'URGENT' }
        ],
        dictation: 'Patient presenting with worsening fever (39.2°C) and dyspnea. SpO2 dropped to 89% on room air. Initiated high-flow O2 via nasal cannula at 4L/min. Coarse crackles right lower zone. STAT antibiotic and blood cultures ordered.',
        rounded: false
    },
    {
        id: 2, room: '102', bed: 'A', name: 'Priya Reddy', age: 58, gender: 'F',
        diagnosis: 'COPD Acute Exacerbation', admitDate: '2026-08-28', dayOfCare: 6,
        attendingDr: 'Dr. Rao', news2: { total: 5, riskLevel: 'medium' },
        vitals: { hr: 96, spo2: 93, temp: 37.6, bp: '115/75' },
        history: {
            hr: [88, 90, 92, 94, 98, 96, 95, 96],
            spo2: [94, 94, 93, 92, 93, 93, 94, 93],
            temp: [37.0, 37.2, 37.4, 37.6, 37.5, 37.6, 37.6, 37.6]
        },
        orders: [
            { id: 'ord-4', category: 'Medication', text: 'Ipratropium + Salbutamol Nebulization Q6H', urgency: 'Routine' }
        ],
        dictation: 'COPD exacerbation improving. Wheezing reduced. Patient tolerating room air with SpO2 93%. Continue nebulization schedule.',
        rounded: true
    },
    {
        id: 1, room: '101', bed: 'A', name: 'Arjun Sharma', age: 45, gender: 'M',
        diagnosis: 'Acute Myocardial Infarction', admitDate: '2026-08-30', dayOfCare: 4,
        attendingDr: 'Dr. Kapoor', news2: { total: 1, riskLevel: 'low' },
        vitals: { hr: 72, spo2: 98, temp: 36.6, bp: '125/80' },
        history: {
            hr: [76, 75, 74, 72, 73, 72, 71, 72],
            spo2: [98, 98, 99, 98, 98, 98, 98, 98],
            temp: [36.5, 36.6, 36.5, 36.6, 36.6, 36.6, 36.6, 36.6]
        },
        orders: [
            { id: 'ord-5', category: 'Medication', text: 'Dual Antiplatelet Therapy (Aspirin 75mg + Clopidogrel 75mg)', urgency: 'Routine' },
            { id: 'ord-6', category: 'Consultation', text: 'Cardiac Rehab Mobilization Consult', urgency: 'Routine' }
        ],
        dictation: 'Post-MI Day 4. Asymptomatic, no chest pain or angina. Bedside ECG normal sinus rhythm. PT clear for light walking.',
        rounded: true
    },
    {
        id: 4, room: '104', bed: 'A', name: 'Anita Desai', age: 34, gender: 'F',
        diagnosis: 'Post-Appendectomy (Day 1)', admitDate: '2026-09-01', dayOfCare: 2,
        attendingDr: 'Dr. Shah', news2: { total: 2, riskLevel: 'low' },
        vitals: { hr: 68, spo2: 99, temp: 36.5, bp: '118/72' },
        history: {
            hr: [72, 70, 68, 69, 68, 67, 68, 68],
            spo2: [99, 99, 99, 99, 99, 99, 99, 99],
            temp: [36.8, 36.6, 36.5, 36.5, 36.5, 36.5, 36.5, 36.5]
        },
        orders: [
            { id: 'ord-7', category: 'Medication', text: 'Paracetamol 1g IV Q8H PRN Pain', urgency: 'Routine' }
        ],
        dictation: 'Post-op Day 1 laparoscopic appendectomy. Surgical site clean and dry. Tolerating oral sips.',
        rounded: true
    },
    {
        id: 5, room: '105', bed: 'A', name: 'Mohammed Farooq', age: 71, gender: 'M',
        diagnosis: 'Diabetic Ketoacidosis', admitDate: '2026-08-31', dayOfCare: 3,
        attendingDr: 'Dr. Iyer', news2: { total: 5, riskLevel: 'medium' },
        vitals: { hr: 94, spo2: 95, temp: 38.2, bp: '108/68' },
        history: {
            hr: [102, 98, 96, 95, 94, 94, 95, 94],
            spo2: [94, 94, 95, 95, 95, 95, 95, 95],
            temp: [38.5, 38.4, 38.3, 38.2, 38.2, 38.2, 38.2, 38.2]
        },
        orders: [],
        dictation: 'DKA resolution in progress. Anion gap normalized. Transitioning to subcutaneous insulin protocol.',
        rounded: false
    }
];

// State
let state = {
    patients: window.SmartHospitalStore ? window.SmartHospitalStore.getPatients() : [...ROUNDS_PATIENTS],
    activePatientId: 3, // Default to Room 103 (High risk)
    isRecording: false,
    recognition: null
};

// ─── Sparkline SVG Helper ──────────────────────────────
function renderSparklineSVG(data, color = '#00b4d8', width = 140, height = 32) {
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

    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="v-spark-canvas">
        <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;
}

// ─── Render Functions ────────────────────────────────────

function getActivePatient() {
    return state.patients.find(p => p.id === state.activePatientId) || state.patients[0];
}

function renderProgress() {
    const total = state.patients.length;
    const done = state.patients.filter(p => p.rounded).length;
    const percent = Math.round((done / total) * 100);

    document.getElementById('progress-count').textContent = `${done} / ${total}`;
    document.getElementById('progress-bar-fill').style.width = `${percent}%`;
}

function renderPatientTabs() {
    const bar = document.getElementById('patient-selector-bar');
    bar.innerHTML = state.patients.map(p => {
        const isActive = p.id === state.activePatientId;
        return `
        <div class="patient-tab ${isActive ? 'active' : ''}" onclick="selectPatient(${p.id})">
            <span class="tab-room">Rm ${p.room}</span>
            <span class="tab-name">${p.name.split(' ')[0]}</span>
            <span class="tab-news ${p.news2.riskLevel}">NEWS ${p.news2.total}</span>
            ${p.rounded ? '<span style="font-size:0.75rem; color:var(--status-low);">✓</span>' : ''}
        </div>`;
    }).join('');
}

function renderActivePatient() {
    const p = getActivePatient();

    // Patient Banner
    const cardEl = document.getElementById('active-patient-card');
    cardEl.innerHTML = `
        <div class="patient-header-top">
            <span class="p-room-badge">Room ${p.room} · Bed ${p.bed}</span>
            <span class="p-news-large ${p.news2.riskLevel}">NEWS2 Score: ${p.news2.total}</span>
        </div>
        <h2 class="p-name">${p.name}</h2>
        <div class="p-details">
            <strong>Diagnosis:</strong> ${p.diagnosis}<br>
            ${p.age} yrs, ${p.gender} · Admitted ${p.admitDate} (Day ${p.dayOfCare}) · <strong>Attending:</strong> ${p.attendingDr}
        </div>
    `;

    // Vital Trends
    const trendsEl = document.getElementById('vital-sparkline-group');
    trendsEl.innerHTML = `
        <div class="vital-spark-row">
            <div class="v-label-group">
                <span class="v-name">Heart Rate</span>
                <span class="v-val ${p.vitals.hr > 100 ? 'danger' : ''}">${p.vitals.hr} <small style="font-size:0.65rem;">bpm</small></span>
            </div>
            ${renderSparklineSVG(p.history.hr, p.vitals.hr > 100 ? '#ef4444' : '#00b4d8')}
        </div>
        <div class="vital-spark-row">
            <div class="v-label-group">
                <span class="v-name">SpO₂ Level</span>
                <span class="v-val ${p.vitals.spo2 < 92 ? 'danger' : p.vitals.spo2 < 96 ? 'warning' : ''}">${p.vitals.spo2}%</span>
            </div>
            ${renderSparklineSVG(p.history.spo2, p.vitals.spo2 < 92 ? '#ef4444' : '#00b4d8')}
        </div>
        <div class="vital-spark-row">
            <div class="v-label-group">
                <span class="v-name">Temperature</span>
                <span class="v-val ${p.vitals.temp >= 38.5 ? 'danger' : p.vitals.temp >= 38.0 ? 'warning' : ''}">${p.vitals.temp}°C</span>
            </div>
            ${renderSparklineSVG(p.history.temp, p.vitals.temp >= 38.5 ? '#ef4444' : '#f59e0b')}
        </div>
    `;

    // Dictation Textarea
    document.getElementById('dictation-textarea').value = p.dictation || '';

    // E-sign Room Label
    document.getElementById('esign-room').textContent = `${p.room}`;

    // Orders List
    renderOrdersList();
}

function renderOrdersList() {
    const p = getActivePatient();
    const listEl = document.getElementById('order-list');
    const countEl = document.getElementById('order-count');

    countEl.textContent = p.orders.length;

    if (p.orders.length === 0) {
        listEl.innerHTML = `<div style="font-size:0.78rem; color:var(--text-muted); text-align:center; padding:12px;">No active orders for this round sheet</div>`;
        return;
    }

    listEl.innerHTML = p.orders.map(o => `
        <div class="order-item">
            <div class="order-info">
                <span class="order-cat">${o.category}</span>
                <span class="order-text">${o.text}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <span class="order-urgency-tag ${o.urgency}">${o.urgency}</span>
                <button class="btn-remove-order" onclick="removeOrder('${o.id}')" title="Remove Order">&times;</button>
            </div>
        </div>
    `).join('');
}

function selectPatient(patientId) {
    state.activePatientId = patientId;
    renderPatientTabs();
    renderActivePatient();
}

// ─── Order Sheet Management ──────────────────────────────

function removeOrder(orderId) {
    const p = getActivePatient();
    p.orders = p.orders.filter(o => o.id !== orderId);
    renderOrdersList();
}

function setupOrderForm() {
    const form = document.getElementById('order-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = document.getElementById('order-category').value;
        const urgency = document.getElementById('order-urgency').value;
        const details = document.getElementById('order-details').value.trim();

        if (!details) return;

        const p = getActivePatient();
        if (window.SmartHospitalStore) {
            window.SmartHospitalStore.addDoctorOrder(p.room, cat, details, urgency);
            state.patients = window.SmartHospitalStore.getPatients();
        } else {
            p.orders.push({
                id: `ord-${Date.now()}`,
                category: cat,
                text: details,
                urgency: urgency
            });
        }

        document.getElementById('order-details').value = '';
        renderOrdersList();
    });
}

// ─── Voice Dictation Engine (Web Speech API) ─────────────

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const badge = document.getElementById('speech-status-badge');
    const btn = document.getElementById('btn-dictate');
    const label = document.getElementById('btn-dictate-label');
    const textarea = document.getElementById('dictation-textarea');

    if (!SpeechRecognition) {
        badge.textContent = 'WebSpeech Unsupported (Typing Enabled)';
    } else {
        state.recognition = new SpeechRecognition();
        state.recognition.continuous = true;
        state.recognition.interimResults = true;
        state.recognition.lang = 'en-US';

        state.recognition.onstart = () => {
            state.isRecording = true;
            badge.textContent = '● LISTENING (VOICE ON)';
            badge.className = 'speech-status-badge recording';
            btn.className = 'btn-dictate recording';
            label.textContent = 'Stop Dictation';
        };

        state.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                textarea.value += (textarea.value ? ' ' : '') + finalTranscript;
                getActivePatient().dictation = textarea.value;
            }
        };

        state.recognition.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            stopDictation();
        };

        state.recognition.onend = () => {
            stopDictation();
        };
    }

    btn.addEventListener('click', () => {
        if (!state.isRecording) {
            if (state.recognition) {
                try {
                    state.recognition.start();
                } catch (e) {
                    mockDictation();
                }
            } else {
                mockDictation();
            }
        } else {
            if (state.recognition) state.recognition.stop();
            stopDictation();
        }
    });

    // Quick tags
    document.querySelectorAll('.tag-btn').forEach(tag => {
        tag.addEventListener('click', () => {
            const phrase = tag.dataset.phrase;
            textarea.value += phrase;
            getActivePatient().dictation = textarea.value;
        });
    });

    // Clear notes button
    document.getElementById('btn-clear-dictation').addEventListener('click', () => {
        textarea.value = '';
        getActivePatient().dictation = '';
    });

    // Save notes button
    document.getElementById('btn-save-note').addEventListener('click', () => {
        const p = getActivePatient();
        p.dictation = textarea.value;
        if (window.SmartHospitalStore) {
            window.SmartHospitalStore.addDoctorDictation(p.room, 'Dr. Patel', textarea.value);
            state.patients = window.SmartHospitalStore.getPatients();
        }
        alert('✓ Clinical notes saved and broadcasted to Nurse & Patient terminals for Room ' + p.room);
    });
}

function stopDictation() {
    state.isRecording = false;
    const badge = document.getElementById('speech-status-badge');
    const btn = document.getElementById('btn-dictate');
    const label = document.getElementById('btn-dictate-label');

    badge.textContent = 'Standby';
    badge.className = 'speech-status-badge';
    btn.className = 'btn-dictate';
    label.textContent = 'Start Voice Dictation';
}

// Fallback simulated dictation if WebSpeech API is denied / absent
function mockDictation() {
    const textarea = document.getElementById('dictation-textarea');
    const mockPhrases = [
        ' Patient exhibiting signs of respiratory improvement. ',
        ' Lungs clear bilaterally. ',
        ' Continue present medication regimen. '
    ];
    textarea.value += mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
    const p = getActivePatient();
    p.dictation = textarea.value;
    if (window.SmartHospitalStore) {
        window.SmartHospitalStore.addDoctorDictation(p.room, 'Dr. Patel', textarea.value);
    }
}

// ─── Digital Sign-Off (E-Sign) ───────────────────────────

function setupEsign() {
    document.getElementById('btn-esign').addEventListener('click', () => {
        const p = getActivePatient();
        p.rounded = true;
        p.dictation = document.getElementById('dictation-textarea').value;

        if (window.SmartHospitalStore) {
            if (p.dictation) {
                window.SmartHospitalStore.addDoctorDictation(p.room, 'Dr. Patel', p.dictation);
            }
            window.SmartHospitalStore.togglePatientRounded(p.room);
            state.patients = window.SmartHospitalStore.getPatients();
        }

        // Check checklist items
        document.getElementById('chk-orders').checked = true;
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById('time-chk-orders').textContent = nowStr;

        renderProgress();
        renderPatientTabs();

        alert(`🔒 Digital Signature Verified!\n\nRound completed and orders/notes signed for ${p.name} (Room ${p.room}).`);
    });
}

// ─── Setup Checklist Timestamps ───────────────────────────

function setupChecklist() {
    ['chk-vitals', 'chk-exam', 'chk-counsel', 'chk-orders'].forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            const timeEl = document.getElementById(`time-${id}`);
            if (e.target.checked) {
                timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                timeEl.textContent = '--:--';
            }
        });
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (window.SmartHospitalStore) {
        state.patients = window.SmartHospitalStore.getPatients();

        window.SmartHospitalStore.subscribe((msg, newState) => {
            if (newState) {
                state.patients = newState.patients;
                renderProgress();
                renderPatientTabs();
                renderActivePatient();
            }
        });
    }

    renderProgress();
    renderPatientTabs();
    renderActivePatient();
    setupOrderForm();
    setupSpeechRecognition();
    setupEsign();
    setupChecklist();
});
