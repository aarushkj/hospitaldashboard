/* ============================================
   FAMILY PORTAL — Application Logic
   AI-Powered Smart Hospital Room
   ============================================ */

// ─── Patient Database (Token Mapped) ─────────────────────────
const PORTAL_PATIENTS = {
    'HK3M9X': {
        id: 3,
        token: 'HK3M9X',
        name: 'Rajesh Kumar',
        initials: 'RK',
        age: 67,
        gender: 'Male',
        room: 'Room 103 Bed B',
        diagnosis: 'Community-Acquired Pneumonia',
        admitDate: 'Aug 31, 2026',
        dayOfCare: 3,
        status: {
            text: 'Stable & Improving',
            level: 'warn', // 'good', 'warn', 'alert'
            desc: 'Responding well to antibiotic therapy and respiratory care.'
        },
        vitals: { hr: 82, spo2: 94, temp: 37.4 },
        attendingDr: 'Dr. Patel',
        primaryNurse: 'Nurse Anjali',
        timeline: [
            { time: '11:30 AM', text: 'Completed morning respiratory check and oxygen therapy assessment.' },
            { time: '09:15 AM', text: 'Morning medication administered as per doctor orders.' },
            { time: '08:00 AM', text: 'Physician rounds completed by Dr. Patel. Patient is resting comfortably.' },
            { time: '07:00 AM', text: 'Morning shift handoff completed by Nurse Anjali.' }
        ]
    },
    'PR582A': {
        id: 2,
        token: 'PR582A',
        name: 'Priya Reddy',
        initials: 'PR',
        age: 58,
        gender: 'Female',
        room: 'Room 102 Bed A',
        diagnosis: 'COPD Exacerbation',
        admitDate: 'Aug 28, 2026',
        dayOfCare: 6,
        status: {
            text: 'Steady Progress',
            level: 'good',
            desc: 'Breathing comfortable. Planned discharge assessment tomorrow.'
        },
        vitals: { hr: 76, spo2: 96, temp: 36.8 },
        attendingDr: 'Dr. Rao',
        primaryNurse: 'Nurse Priya',
        timeline: [
            { time: '12:00 PM', text: 'Lunch served. Patient ate well and took afternoon meds.' },
            { time: '10:00 AM', text: 'Nebulizer therapy completed with improved lung sounds.' },
            { time: '08:30 AM', text: 'Attending doctor review completed.' }
        ]
    },
    'AS451B': {
        id: 1,
        token: 'AS451B',
        name: 'Arjun Sharma',
        initials: 'AS',
        age: 45,
        gender: 'Male',
        room: 'Room 101 Bed A',
        diagnosis: 'Acute Myocardial Infarction',
        admitDate: 'Aug 30, 2026',
        dayOfCare: 4,
        status: {
            text: 'Resting & Stable',
            level: 'good',
            desc: 'Cardiac rhythm stable. Mobilization exercises initiated.'
        },
        vitals: { hr: 72, spo2: 98, temp: 36.6 },
        attendingDr: 'Dr. Kapoor',
        primaryNurse: 'Nurse Meera',
        timeline: [
            { time: '11:00 AM', text: 'Bedside ECG completed — normal sinus rhythm confirmed.' },
            { time: '09:30 AM', text: 'Light walking exercise assisted by physical therapy team.' },
            { time: '07:30 AM', text: 'Breakfast completed and morning vitals recorded.' }
        ]
    }
};

// State
let currentPatient = null;
let updateInterval = null;

// ─── Plain Language Mapping ──────────────────────────────
function getPlainLanguageVitals(vitals) {
    const items = [];

    // Heart Rate
    const hr = vitals.hr;
    if (hr >= 60 && hr <= 100) {
        items.push({
            icon: '💚',
            level: 'good',
            title: 'Heart Rate',
            desc: 'Heart rate is normal and steady'
        });
    } else if ((hr >= 40 && hr < 60) || (hr > 100 && hr <= 130)) {
        items.push({
            icon: '🟡',
            level: 'warn',
            title: 'Heart Rate',
            desc: 'Heart rate is slightly outside normal range, being monitored'
        });
    } else {
        items.push({
            icon: '🔴',
            level: 'alert',
            title: 'Heart Rate',
            desc: 'Heart rate is receiving close clinical attention'
        });
    }

    // Oxygen Level (SpO2)
    const spo2 = vitals.spo2;
    if (spo2 >= 96) {
        items.push({
            icon: '🫁',
            level: 'good',
            title: 'Oxygen Level',
            desc: 'Oxygen saturation is good'
        });
    } else if (spo2 >= 92 && spo2 < 96) {
        items.push({
            icon: '🟡',
            level: 'warn',
            title: 'Oxygen Level',
            desc: 'Oxygen level is slightly low, supported by care team'
        });
    } else {
        items.push({
            icon: '🔴',
            level: 'alert',
            title: 'Oxygen Level',
            desc: 'Oxygen level is being actively managed by staff'
        });
    }

    // Body Temperature
    const temp = vitals.temp;
    if (temp >= 36.1 && temp <= 38.0) {
        items.push({
            icon: '🌡️',
            level: 'good',
            title: 'Body Temperature',
            desc: 'Body temperature is completely normal'
        });
    } else if ((temp > 35.0 && temp < 36.1) || (temp > 38.0 && temp <= 39.0)) {
        items.push({
            icon: '🟡',
            level: 'warn',
            title: 'Body Temperature',
            desc: 'Body temperature is slightly elevated/low'
        });
    } else {
        items.push({
            icon: '🔴',
            level: 'alert',
            title: 'Body Temperature',
            desc: 'Temperature is being actively monitored by nursing team'
        });
    }

    return items;
}

// ─── Render Functions ────────────────────────────────────

function renderPatientPortal(patient) {
    currentPatient = patient;

    // Nav pill
    document.getElementById('nav-patient-pill').textContent = `${patient.name} (${patient.room})`;

    // Banner
    document.getElementById('patient-initials').textContent = patient.initials;
    document.getElementById('patient-name').textContent = patient.name;
    document.getElementById('patient-room').textContent = patient.room;
    document.getElementById('patient-subtext').textContent = `${patient.age} yrs, ${patient.gender} · Admitted ${patient.admitDate} (Day ${patient.dayOfCare} of care)`;

    // Status box
    const statusBox = document.getElementById('status-box');
    statusBox.innerHTML = `
        <div class="status-badge-large ${patient.status.level}">
            <span>${patient.status.level === 'good' ? '🟢' : patient.status.level === 'warn' ? '🟡' : '🔴'}</span>
            <span>${patient.status.text}</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); max-width: 320px; text-align: right;">${patient.status.desc}</p>
        <span class="status-time">Last clinical check: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;

    // Vitals Summary
    renderVitalsSummary();

    // Timeline
    const timelineEl = document.getElementById('portal-timeline');
    timelineEl.innerHTML = patient.timeline.map(item => `
        <div class="timeline-item">
            <div class="timeline-time">${item.time}</div>
            <div class="timeline-desc">${item.text}</div>
        </div>
    `).join('');

    // Care Team
    const careTeamEl = document.getElementById('care-team-list');
    careTeamEl.innerHTML = `
        <div class="care-member">
            <div class="member-avatar">👨‍⚕️</div>
            <div class="member-info">
                <h4>${patient.attendingDr}</h4>
                <p>Attending Physician · Cardiology</p>
            </div>
        </div>
        <div class="care-member">
            <div class="member-avatar">👩‍⚕️</div>
            <div class="member-info">
                <h4>${patient.primaryNurse}</h4>
                <p>Primary Shift Nurse · Desk Ext #304</p>
            </div>
        </div>
    `;

    // Switch views
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('portal-screen').style.display = 'flex';
}

function renderVitalsSummary() {
    if (!currentPatient) return;
    const items = getPlainLanguageVitals(currentPatient.vitals);
    const listEl = document.getElementById('vitals-summary-list');

    listEl.innerHTML = items.map(item => `
        <div class="vital-summary-item">
            <div class="vital-icon-box ${item.level}">${item.icon}</div>
            <div class="vital-text-content">
                <div class="vital-text-title">${item.title}</div>
                <div class="vital-text-desc ${item.level}">${item.desc}</div>
            </div>
        </div>
    `).join('');
}

// ─── Simulation Loop ─────────────────────────────────────

function startVitalsSimulation() {
    if (updateInterval) clearInterval(updateInterval);

    updateInterval = setInterval(() => {
        if (!currentPatient) return;

        // Slight realistic variation
        currentPatient.vitals.hr += Math.floor((Math.random() - 0.5) * 4);
        currentPatient.vitals.hr = Math.min(130, Math.max(55, currentPatient.vitals.hr));

        currentPatient.vitals.spo2 += Math.floor((Math.random() - 0.4) * 2);
        currentPatient.vitals.spo2 = Math.min(100, Math.max(90, currentPatient.vitals.spo2));

        renderVitalsSummary();
    }, 4000);
}

// ─── Authentication & Event Handlers ──────────────────────

function setupEvents() {
    // Login form submit
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tokenInput = document.getElementById('access-token');
        const token = tokenInput.value.trim().toUpperCase();

        const patient = window.SmartHospitalStore ? window.SmartHospitalStore.getPatient(token) : PORTAL_PATIENTS[token];

        if (patient) {
            sessionStorage.setItem('portal_token', token);
            renderPatientPortal(patient);
        } else {
            alert('Invalid Passcode. Please try HK3M9X, PR582A, or AS451B');
        }
    });

    // Hint chips click
    document.querySelectorAll('.hint-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const token = chip.dataset.token;
            document.getElementById('access-token').value = token;
            const patient = window.SmartHospitalStore ? window.SmartHospitalStore.getPatient(token) : PORTAL_PATIENTS[token];
            if (patient) {
                sessionStorage.setItem('portal_token', token);
                renderPatientPortal(patient);
            }
        });
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        sessionStorage.removeItem('portal_token');
        currentPatient = null;
        if (updateInterval) clearInterval(updateInterval);
        document.getElementById('portal-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    });

    // Message form submit
    const msgForm = document.getElementById('message-form');
    msgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const topic = document.getElementById('msg-preset').value;
        const text = document.getElementById('msg-text').value.trim();
        const statusEl = document.getElementById('msg-status');

        if (!text) return;

        // Broadcast to SmartHospitalStore so Nurse Command Station receives the message
        if (window.SmartHospitalStore && currentPatient) {
            window.SmartHospitalStore.sendFamilyMessage(currentPatient.room, 'Family Member', `[${topic}] ${text}`);
        }

        // Show success state
        statusEl.className = 'msg-status success';
        statusEl.textContent = '✓ Message sent directly to Nurse Station Command Desk!';
        document.getElementById('msg-text').value = '';

        setTimeout(() => {
            statusEl.textContent = '';
        }, 4000);
    });
}

// Auto-login from session storage if present
function checkExistingSession() {
    const savedToken = sessionStorage.getItem('portal_token');
    if (savedToken) {
        const patient = window.SmartHospitalStore ? window.SmartHospitalStore.getPatient(savedToken) : PORTAL_PATIENTS[savedToken];
        if (patient) {
            renderPatientPortal(patient);
        }
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    setupEvents();
    checkExistingSession();

    if (window.SmartHospitalStore) {
        window.SmartHospitalStore.subscribe((msg, newState) => {
            const savedToken = sessionStorage.getItem('portal_token');
            if (savedToken) {
                const p = window.SmartHospitalStore.getPatient(savedToken);
                if (p) renderPatientPortal(p);
            }
        });
    }
});
