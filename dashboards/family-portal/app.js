/* ============================================
   FAMILY PORTAL — Application Logic
   AI-Powered Smart Hospital Room
   ============================================ */

// ─── Patient Database (Token Mapped Fallback) ─────────────────────────
const PORTAL_PATIENTS = {
    'HK3M9X': {
        id: 3, token: 'HK3M9X', name: 'Rajesh Kumar', initials: 'RK', age: 67, gender: 'Male',
        room: '103', bed: 'B', diagnosis: 'Community-Acquired Pneumonia', admitDate: 'Aug 31, 2026', dayOfCare: 3,
        familyStatus: { text: 'Stable & Improving', level: 'warn', desc: 'Responding well to antibiotic therapy and respiratory care.' },
        vitals: { hr: 82, spo2: 94, temp: 37.4 }, attendingDr: 'Dr. Patel', primaryNurse: 'Nurse Anjali',
        timeline: [
            { time: '11:30 AM', text: 'Completed morning respiratory check and oxygen therapy assessment.' },
            { time: '09:15 AM', text: 'Morning medication administered as per doctor orders.' },
            { time: '08:00 AM', text: 'Physician rounds completed by Dr. Patel. Patient is resting comfortably.' },
            { time: '07:00 AM', text: 'Morning shift handoff completed by Nurse Anjali.' }
        ]
    },
    'PR582A': {
        id: 2, token: 'PR582A', name: 'Priya Reddy', initials: 'PR', age: 58, gender: 'Female',
        room: '102', bed: 'A', diagnosis: 'COPD Exacerbation', admitDate: 'Aug 28, 2026', dayOfCare: 6,
        familyStatus: { text: 'Steady Progress', level: 'good', desc: 'Breathing comfortable. Planned discharge assessment tomorrow.' },
        vitals: { hr: 76, spo2: 96, temp: 36.8 }, attendingDr: 'Dr. Rao', primaryNurse: 'Nurse Priya',
        timeline: [
            { time: '12:00 PM', text: 'Lunch served. Patient ate well and took afternoon meds.' },
            { time: '10:00 AM', text: 'Nebulizer therapy completed with improved lung sounds.' },
            { time: '08:30 AM', text: 'Attending doctor review completed.' }
        ]
    },
    'AS451B': {
        id: 1, token: 'AS451B', name: 'Arjun Sharma', initials: 'AS', age: 45, gender: 'Male',
        room: '101', bed: 'A', diagnosis: 'Acute Myocardial Infarction', admitDate: 'Aug 30, 2026', dayOfCare: 4,
        familyStatus: { text: 'Resting & Stable', level: 'good', desc: 'Cardiac rhythm stable. Mobilization exercises initiated.' },
        vitals: { hr: 72, spo2: 98, temp: 36.6 }, attendingDr: 'Dr. Kapoor', primaryNurse: 'Nurse Meera',
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
    if (!vitals) return [];
    const items = [];

    // Heart Rate
    const hr = vitals.hr || 75;
    if (hr >= 60 && hr <= 100) {
        items.push({ icon: '💚', level: 'good', title: 'Heart Rate', desc: 'Heart rate is normal and steady' });
    } else if ((hr >= 40 && hr < 60) || (hr > 100 && hr <= 130)) {
        items.push({ icon: '🟡', level: 'warn', title: 'Heart Rate', desc: 'Heart rate is slightly outside normal range, being monitored' });
    } else {
        items.push({ icon: '🔴', level: 'alert', title: 'Heart Rate', desc: 'Heart rate is receiving close clinical attention' });
    }

    // Oxygen Level (SpO2)
    const spo2 = vitals.spo2 || 98;
    if (spo2 >= 96) {
        items.push({ icon: '🫁', level: 'good', title: 'Oxygen Level', desc: 'Oxygen saturation is good' });
    } else if (spo2 >= 92 && spo2 < 96) {
        items.push({ icon: '🟡', level: 'warn', title: 'Oxygen Level', desc: 'Oxygen level is slightly low, supported by care team' });
    } else {
        items.push({ icon: '🔴', level: 'alert', title: 'Oxygen Level', desc: 'Oxygen level is being actively managed by staff' });
    }

    // Body Temperature
    const temp = vitals.temp || 36.8;
    if (temp >= 36.1 && temp <= 38.0) {
        items.push({ icon: '🌡️', level: 'good', title: 'Body Temperature', desc: 'Body temperature is completely normal' });
    } else if ((temp > 35.0 && temp < 36.1) || (temp > 38.0 && temp <= 39.0)) {
        items.push({ icon: '🟡', level: 'warn', title: 'Body Temperature', desc: 'Body temperature is slightly elevated/low' });
    } else {
        items.push({ icon: '🔴', level: 'alert', title: 'Body Temperature', desc: 'Temperature is being actively monitored by nursing team' });
    }

    return items;
}

// ─── Render Functions ────────────────────────────────────

function renderPatientPortal(patient) {
    if (!patient) return;
    currentPatient = patient;

    const initials = patient.initials || (patient.name ? patient.name.split(' ').map(n => n[0]).join('') : 'P');
    const roomStr = String(patient.room).startsWith('Room') ? patient.room : `Room ${patient.room} Bed ${patient.bed || 'A'}`;
    const genderStr = patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : (patient.gender || 'Patient');
    const dayStr = patient.dayOfCare || patient.dayOfAdmission || 1;
    const statusObj = patient.familyStatus || patient.status || { text: 'Resting & Stable', level: 'good', desc: 'Vitals monitored regularly.' };

    const navPill = document.getElementById('nav-patient-pill');
    if (navPill) navPill.textContent = `${patient.name} (${roomStr})`;

    const initEl = document.getElementById('patient-initials');
    if (initEl) initEl.textContent = initials;

    const nameEl = document.getElementById('patient-name');
    if (nameEl) nameEl.textContent = patient.name;

    const roomEl = document.getElementById('patient-room');
    if (roomEl) roomEl.textContent = roomStr;

    const subtextEl = document.getElementById('patient-subtext');
    if (subtextEl) subtextEl.textContent = `${patient.age || '--'} yrs, ${genderStr} · Admitted ${patient.admitDate || 'Recently'} (Day ${dayStr} of care)`;

    const statusBox = document.getElementById('status-box');
    if (statusBox) {
        statusBox.innerHTML = `
            <div class="status-badge-large ${statusObj.level || 'good'}">
                <span>${statusObj.level === 'alert' ? '🔴' : statusObj.level === 'warn' ? '🟡' : '🟢'}</span>
                <span>${statusObj.text || 'Stable'}</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); max-width: 320px; text-align: right;">${statusObj.desc || ''}</p>
            <span class="status-time">Last clinical check: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        `;
    }

    renderVitalsSummary();

    const timelineEl = document.getElementById('portal-timeline');
    if (timelineEl) {
        const timelineItems = patient.timeline || [];
        if (timelineItems.length === 0) {
            timelineEl.innerHTML = '<div class="timeline-item"><div class="timeline-desc">No recent activities logged today.</div></div>';
        } else {
            timelineEl.innerHTML = timelineItems.map(item => `
                <div class="timeline-item">
                    <div class="timeline-time">${item.time || ''}</div>
                    <div class="timeline-desc">${item.text || ''}</div>
                </div>
            `).join('');
        }
    }

    const careTeamEl = document.getElementById('care-team-list');
    if (careTeamEl) {
        careTeamEl.innerHTML = `
            <div class="care-member">
                <div class="member-avatar">👨‍⚕️</div>
                <div class="member-info">
                    <h4>${patient.attendingDr || 'Dr. Patel'}</h4>
                    <p>Attending Physician · Cardiology</p>
                </div>
            </div>
            <div class="care-member">
                <div class="member-avatar">👩‍⚕️</div>
                <div class="member-info">
                    <h4>${patient.primaryNurse || 'Nurse Priya'}</h4>
                    <p>Primary Shift Nurse · Desk Ext #304</p>
                </div>
            </div>
        `;
    }

    const authScreen = document.getElementById('auth-screen');
    const portalScreen = document.getElementById('portal-screen');
    if (authScreen) authScreen.style.display = 'none';
    if (portalScreen) portalScreen.style.display = 'flex';
}

function renderVitalsSummary() {
    if (!currentPatient || !currentPatient.vitals) return;
    const items = getPlainLanguageVitals(currentPatient.vitals);
    const listEl = document.getElementById('vitals-summary-list');
    if (!listEl) return;

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

function findPatientByToken(token) {
    if (!token) return null;
    const clean = String(token).trim().toUpperCase();
    let patient = null;
    if (window.SmartHospitalStore) {
        patient = window.SmartHospitalStore.getPatient(clean);
    }
    if (!patient && PORTAL_PATIENTS[clean]) {
        patient = PORTAL_PATIENTS[clean];
    }
    return patient;
}

// ─── Authentication & Event Handlers ──────────────────────

function setupEvents() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tokenInput = document.getElementById('access-token');
        const token = tokenInput.value.trim().toUpperCase();

        const patient = findPatientByToken(token);

        if (patient) {
            sessionStorage.setItem('portal_token', token);
            renderPatientPortal(patient);
        } else {
            alert(`Invalid Passcode "${token}". Please try HK3M9X, PR582A, or AS451B`);
        }
    });

    document.querySelectorAll('.hint-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const token = chip.dataset.token;
            document.getElementById('access-token').value = token;
            const patient = findPatientByToken(token);
            if (patient) {
                sessionStorage.setItem('portal_token', token);
                renderPatientPortal(patient);
            }
        });
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        sessionStorage.removeItem('portal_token');
        currentPatient = null;
        if (updateInterval) clearInterval(updateInterval);
        document.getElementById('portal-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    });

    const msgForm = document.getElementById('message-form');
    msgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const topic = document.getElementById('msg-preset').value;
        const text = document.getElementById('msg-text').value.trim();
        const statusEl = document.getElementById('msg-status');

        if (!text) return;

        if (window.SmartHospitalStore && currentPatient) {
            window.SmartHospitalStore.sendFamilyMessage(currentPatient.room, 'Family Member', `[${topic}] ${text}`);
        }

        statusEl.className = 'msg-status success';
        statusEl.textContent = '✓ Message sent directly to Nurse Station Command Desk!';
        document.getElementById('msg-text').value = '';

        setTimeout(() => {
            statusEl.textContent = '';
        }, 4000);
    });
}

function checkExistingSession() {
    const savedToken = sessionStorage.getItem('portal_token');
    if (savedToken) {
        const patient = findPatientByToken(savedToken);
        if (patient) {
            renderPatientPortal(patient);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupEvents();
    checkExistingSession();

    if (window.SmartHospitalStore) {
        window.SmartHospitalStore.subscribe((msg, newState) => {
            const savedToken = sessionStorage.getItem('portal_token');
            if (savedToken) {
                const p = findPatientByToken(savedToken);
                if (p) renderPatientPortal(p);
            }
        });
    }
});
