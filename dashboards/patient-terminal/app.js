/* ============================================
   PATIENT BEDSIDE TERMINAL — Application Logic
   AI-Powered Smart Hospital Room
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const store = window.SmartHospitalStore;

    // Determine current room from URL param or default to Room 103
    const urlParams = new URLSearchParams(window.location.search);
    let currentRoom = urlParams.get('room') || '103';

    let activeCallId = null;

    // DOM Elements
    const roomSelect = document.getElementById('room-select');
    const headerPatientName = document.getElementById('header-patient-name');
    const headerRoomBadge = document.getElementById('header-room-badge');
    const headerAvatar = document.getElementById('header-avatar');
    const liveClock = document.getElementById('live-clock');

    const valHr = document.getElementById('val-hr');
    const valSpo2 = document.getElementById('val-spo2');
    const valTemp = document.getElementById('val-temp');
    const statusHr = document.getElementById('status-hr');
    const statusSpo2 = document.getElementById('status-spo2');
    const statusTemp = document.getElementById('status-temp');

    const btnNurseCall = document.getElementById('btn-nurse-call');
    const callBtnText = document.getElementById('call-btn-text');
    const callActiveBanner = document.getElementById('call-active-banner');
    const callStatusTitle = document.getElementById('call-status-title');
    const callStatusDesc = document.getElementById('call-status-desc');
    const btnCancelCall = document.getElementById('btn-cancel-call');

    const toggleLights = document.getElementById('toggle-lights');
    const sliderBrightness = document.getElementById('slider-brightness');
    const valBrightness = document.getElementById('val-brightness');

    const valBedIncline = document.getElementById('val-bed-incline');
    const btnBedUp = document.getElementById('btn-bed-up');
    const btnBedDown = document.getElementById('btn-bed-down');

    const scheduleTimeline = document.getElementById('schedule-timeline');

    // ─── Clock Timer ──────────────────────────────
    function updateClock() {
        const now = new Date();
        liveClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ─── Populate Room Selector ──────────────────────────────
    function populateRoomSelector() {
        const patients = store.getPatients();
        roomSelect.innerHTML = '';
        patients.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.room;
            opt.textContent = `Room ${p.room} — ${p.name}`;
            if (p.room === currentRoom) opt.selected = true;
            roomSelect.appendChild(opt);
        });
    }

    roomSelect.addEventListener('change', (e) => {
        currentRoom = e.target.value;
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('room', currentRoom);
        window.history.pushState({}, '', newUrl);
        renderPatientData();
    });

    // ─── Render Patient View ──────────────────────────────
    function renderPatientData() {
        const patient = store.getPatient(currentRoom);
        if (!patient) return;

        // Header Info
        headerPatientName.textContent = patient.name;
        headerRoomBadge.textContent = `Room ${patient.room} · Bed ${patient.bed}`;
        const initials = patient.name.split(' ').map(n => n[0]).join('');
        headerAvatar.textContent = initials;

        // Vitals
        const v = patient.vitals;
        valHr.textContent = v.hr || '--';
        valSpo2.textContent = v.spo2 || '--';
        valTemp.textContent = v.temp || '--';

        // Vitals Status Badges
        if (v.hr < 60 || v.hr > 100) {
            statusHr.textContent = 'Monitored';
            statusHr.className = 'vital-status status-warning';
        } else {
            statusHr.textContent = 'Normal';
            statusHr.className = 'vital-status status-normal';
        }

        if (v.spo2 < 92) {
            statusSpo2.textContent = 'Attention Required';
            statusSpo2.className = 'vital-status status-alert';
        } else if (v.spo2 <= 94) {
            statusSpo2.textContent = 'Slightly Low';
            statusSpo2.className = 'vital-status status-warning';
        } else {
            statusSpo2.textContent = 'Optimal';
            statusSpo2.className = 'vital-status status-normal';
        }

        if (v.temp > 38.0 || v.temp < 35.5) {
            statusTemp.textContent = 'Fever Warning';
            statusTemp.className = 'vital-status status-alert';
        } else {
            statusTemp.textContent = 'Normal';
            statusTemp.className = 'vital-status status-normal';
        }

        // Room Controls
        const rc = patient.roomControls || { lightOn: true, brightness: 80, bedIncline: 30 };
        toggleLights.checked = rc.lightOn;
        sliderBrightness.value = rc.brightness;
        valBrightness.textContent = `${rc.brightness}%`;
        valBedIncline.textContent = `${rc.bedIncline}°`;

        // Check Nurse Call Status
        const calls = store.getNurseCalls();
        const activeCall = calls.find(c => c.roomId === currentRoom && c.status !== 'resolved');

        if (activeCall) {
            activeCallId = activeCall.id;
            callActiveBanner.style.display = 'flex';

            if (activeCall.status === 'acknowledged') {
                callStatusTitle.textContent = 'Nurse Responding';
                callStatusDesc.textContent = `${activeCall.acknowledgedBy || 'Nurse Priya'} acknowledged call and is arriving shortly!`;
            } else {
                callStatusTitle.textContent = 'Nurse Alerted (SLA Active)';
                callStatusDesc.textContent = `Call sent to Nurse Station desk. Priority: ${activeCall.type.toUpperCase()}`;
            }
        } else {
            activeCallId = null;
            callActiveBanner.style.display = 'none';
        }

        // Schedule / Timeline
        renderSchedule(patient);
    }

    function renderSchedule(patient) {
        scheduleTimeline.innerHTML = '';

        const items = [];

        // Orders from Doctor
        (patient.orders || []).forEach(ord => {
            items.push({
                time: ord.time || '10:00 AM',
                text: `💊 Order: ${ord.text} (${ord.urgency})`
            });
        });

        // Timeline events
        (patient.timeline || []).forEach(t => {
            items.push({
                time: t.time,
                text: t.text
            });
        });

        if (items.length === 0) {
            scheduleTimeline.innerHTML = '<div class="timeline-item"><span class="timeline-text">No pending medication orders scheduled.</span></div>';
            return;
        }

        items.slice(0, 5).forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.innerHTML = `
                <span class="timeline-time">${item.time}</span>
                <span class="timeline-text">${item.text}</span>
            `;
            scheduleTimeline.appendChild(div);
        });
    }

    // ─── Nurse Call Actions ──────────────────────────────
    btnNurseCall.addEventListener('click', () => {
        triggerNurseCall('clinical', 'Bedside Call Button Pressed');
    });

    function triggerNurseCall(type, message) {
        const call = store.addNurseCall(currentRoom, type, message);
        activeCallId = call.id;
        renderPatientData();
    }

    btnCancelCall.addEventListener('click', () => {
        if (activeCallId) {
            store.resolveNurseCall(activeCallId);
            activeCallId = null;
            renderPatientData();
        }
    });

    // ─── Comfort Request Buttons ──────────────────────────────
    document.querySelectorAll('.comfort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const requestName = btn.dataset.request;
            const type = btn.dataset.type || 'comfort';
            triggerNurseCall(type, `Comfort Request: ${requestName}`);
            
            // Temporary feedback animation
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = 'none', 150);
        });
    });

    // ─── Room Amenities Controls ──────────────────────────────
    toggleLights.addEventListener('change', (e) => {
        store.setRoomControls(currentRoom, { lightOn: e.target.checked });
    });

    sliderBrightness.addEventListener('input', (e) => {
        valBrightness.textContent = `${e.target.value}%`;
        store.setRoomControls(currentRoom, { brightness: parseInt(e.target.value) });
    });

    btnBedUp.addEventListener('click', () => {
        const patient = store.getPatient(currentRoom);
        let cur = (patient.roomControls || {}).bedIncline || 30;
        if (cur < 60) {
            cur += 5;
            store.setRoomControls(currentRoom, { bedIncline: cur });
            valBedIncline.textContent = `${cur}°`;
        }
    });

    btnBedDown.addEventListener('click', () => {
        const patient = store.getPatient(currentRoom);
        let cur = (patient.roomControls || {}).bedIncline || 30;
        if (cur > 0) {
            cur -= 5;
            store.setRoomControls(currentRoom, { bedIncline: cur });
            valBedIncline.textContent = `${cur}°`;
        }
    });

    // ─── Real-Time Store Subscription ──────────────────────────────
    store.subscribe((msg) => {
        // Re-render when vitals, nurse calls, orders, or controls update
        renderPatientData();
    });

    // Initial Render
    populateRoomSelector();
    renderPatientData();
});
