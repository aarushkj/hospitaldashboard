/* ============================================
   SMART HOSPITAL STORE & REAL-TIME STATE BUS
   Unified state manager & event bus using 
   BroadcastChannel & localStorage across dashboards.
   ============================================ */

(function (window) {
    'use strict';

    const CHANNEL_NAME = 'smart_hospital_bus_v1';
    const STORAGE_KEY = 'smart_hospital_state_v1';

    // ─── Default Initial Dataset (12 Patients) ──────────────────────────
    const DEFAULT_PATIENTS = [
        {
            id: 1, room: '101', bed: 'A', token: 'AS451B',
            name: 'Arjun Sharma', age: 45, gender: 'M',
            diagnosis: 'Acute Myocardial Infarction', admitDate: '2026-08-30', dayOfCare: 4,
            attendingDr: 'Dr. Kapoor', primaryNurse: 'Nurse Meera',
            vitals: { hr: 72, spo2: 98, temp: 36.6, respRate: 16, systolicBp: 125, diastolicBp: 80 },
            history: {
                hr: [76, 75, 74, 72, 73, 72, 71, 72],
                spo2: [98, 98, 99, 98, 98, 98, 98, 98],
                temp: [36.5, 36.6, 36.5, 36.6, 36.6, 36.6, 36.6, 36.6]
            },
            consciousness: 'A', supplementalO2: false, spo2Scale: 1,
            roomControls: { lightOn: true, brightness: 80, bedIncline: 25 },
            orders: [
                { id: 'ord-5', category: 'Medication', text: 'Dual Antiplatelet Therapy (Aspirin 75mg + Clopidogrel 75mg)', urgency: 'Routine', time: '09:00 AM', status: 'signed' },
                { id: 'ord-6', category: 'Consultation', text: 'Cardiac Rehab Mobilization Consult', urgency: 'Routine', time: '10:30 AM', status: 'signed' }
            ],
            dictations: [
                { id: 'dict-1', author: 'Dr. Kapoor', time: '11:00 AM', text: 'Post-MI Day 4. Asymptomatic, no chest pain. Bedside ECG normal sinus rhythm. PT clear for light walking.' }
            ],
            timeline: [
                { time: '11:00 AM', text: 'Bedside ECG completed — normal sinus rhythm confirmed.' },
                { time: '09:30 AM', text: 'Light walking exercise assisted by physical therapy team.' },
                { time: '07:30 AM', text: 'Breakfast completed and morning vitals recorded.' }
            ],
            familyStatus: { text: 'Resting & Stable', level: 'good', desc: 'Cardiac rhythm stable. Mobilization exercises initiated.' },
            rounded: true
        },
        {
            id: 2, room: '102', bed: 'A', token: 'PR582A',
            name: 'Priya Reddy', age: 58, gender: 'F',
            diagnosis: 'COPD Acute Exacerbation', admitDate: '2026-08-28', dayOfCare: 6,
            attendingDr: 'Dr. Rao', primaryNurse: 'Nurse Priya',
            vitals: { hr: 96, spo2: 93, temp: 37.6, respRate: 22, systolicBp: 115, diastolicBp: 75 },
            history: {
                hr: [88, 90, 92, 94, 98, 96, 95, 96],
                spo2: [94, 94, 93, 92, 93, 93, 94, 93],
                temp: [37.0, 37.2, 37.4, 37.6, 37.5, 37.6, 37.6, 37.6]
            },
            consciousness: 'A', supplementalO2: true, spo2Scale: 2,
            roomControls: { lightOn: true, brightness: 60, bedIncline: 35 },
            orders: [
                { id: 'ord-4', category: 'Medication', text: 'Ipratropium + Salbutamol Nebulization Q6H', urgency: 'Routine', time: '10:00 AM', status: 'signed' }
            ],
            dictations: [
                { id: 'dict-2', author: 'Dr. Rao', time: '08:30 AM', text: 'COPD exacerbation improving. Wheezing reduced. Patient tolerating low-flow supplemental O2.' }
            ],
            timeline: [
                { time: '12:00 PM', text: 'Lunch served. Patient ate well and took afternoon meds.' },
                { time: '10:00 AM', text: 'Nebulizer therapy completed with improved lung sounds.' },
                { time: '08:30 AM', text: 'Attending doctor review completed.' }
            ],
            familyStatus: { text: 'Steady Progress', level: 'good', desc: 'Breathing comfortable. Planned discharge assessment tomorrow.' },
            rounded: true
        },
        {
            id: 3, room: '103', bed: 'B', token: 'HK3M9X',
            name: 'Rajesh Kumar', age: 67, gender: 'M',
            diagnosis: 'Community-Acquired Pneumonia', admitDate: '2026-08-31', dayOfCare: 3,
            attendingDr: 'Dr. Patel', primaryNurse: 'Nurse Anjali',
            vitals: { hr: 118, spo2: 89, temp: 39.2, respRate: 24, systolicBp: 95, diastolicBp: 60 },
            history: {
                hr: [95, 98, 104, 110, 115, 118, 122, 118],
                spo2: [96, 95, 93, 91, 90, 89, 88, 89],
                temp: [37.5, 37.8, 38.2, 38.8, 39.0, 39.2, 39.1, 39.2]
            },
            consciousness: 'A', supplementalO2: true, spo2Scale: 1,
            roomControls: { lightOn: false, brightness: 30, bedIncline: 45 },
            orders: [
                { id: 'ord-1', category: 'Medication', text: 'Ceftriaxone 1g IV Q12H STAT', urgency: 'STAT', time: '11:45 AM', status: 'signed' },
                { id: 'ord-2', category: 'Imaging', text: 'Chest X-Ray PA View - Bedside Urgent', urgency: 'URGENT', time: '11:50 AM', status: 'signed' },
                { id: 'ord-3', category: 'Lab Work', text: 'CBC + CRP + Blood Cultures x 2', urgency: 'URGENT', time: '11:52 AM', status: 'signed' }
            ],
            dictations: [
                { id: 'dict-3', author: 'Dr. Patel', time: '11:40 AM', text: 'Patient presenting with worsening fever (39.2°C) and dyspnea. SpO2 dropped to 89% on room air. Initiated high-flow O2 via nasal cannula at 4L/min. Coarse crackles right lower zone.' }
            ],
            timeline: [
                { time: '11:40 AM', text: 'Dr. Patel initiated STAT IV Ceftriaxone & high-flow oxygen.' },
                { time: '11:30 AM', text: 'Completed morning respiratory check and oxygen therapy assessment.' },
                { time: '09:15 AM', text: 'Morning medication administered as per doctor orders.' },
                { time: '07:00 AM', text: 'Morning shift handoff completed by Nurse Anjali.' }
            ],
            familyStatus: { text: 'Receiving Close Care', level: 'warn', desc: 'Receiving high-flow oxygen and IV antibiotics. Care team actively monitoring.' },
            rounded: false
        },
        {
            id: 4, room: '104', bed: 'A', token: 'AD341A',
            name: 'Anita Desai', age: 34, gender: 'F',
            diagnosis: 'Post-Appendectomy (Day 1)', admitDate: '2026-09-01', dayOfCare: 2,
            attendingDr: 'Dr. Shah', primaryNurse: 'Nurse Priya',
            vitals: { hr: 68, spo2: 99, temp: 36.5, respRate: 14, systolicBp: 118, diastolicBp: 72 },
            history: {
                hr: [72, 70, 68, 69, 68, 67, 68, 68],
                spo2: [99, 99, 99, 99, 99, 99, 99, 99],
                temp: [36.8, 36.6, 36.5, 36.5, 36.5, 36.5, 36.5, 36.5]
            },
            consciousness: 'A', supplementalO2: false, spo2Scale: 1,
            roomControls: { lightOn: true, brightness: 75, bedIncline: 15 },
            orders: [
                { id: 'ord-7', category: 'Medication', text: 'Paracetamol 1g IV Q8H PRN Pain', urgency: 'Routine', time: '08:00 AM', status: 'signed' }
            ],
            dictations: [
                { id: 'dict-4', author: 'Dr. Shah', time: '09:15 AM', text: 'Post-op Day 1 laparoscopic appendectomy. Surgical site clean and dry. Tolerating oral sips.' }
            ],
            timeline: [
                { time: '10:00 AM', text: 'Dressing check clean. Pain managed well.' },
                { time: '08:00 AM', text: 'Morning IV analgesia administered.' }
            ],
            familyStatus: { text: 'Recovering Well', level: 'good', desc: 'Post-surgery recovery proceeding smoothly. Surgical wounds clean.' },
            rounded: true
        },
        {
            id: 5, room: '105', bed: 'A', token: 'MF715A',
            name: 'Mohammed Farooq', age: 71, gender: 'M',
            diagnosis: 'Diabetic Ketoacidosis', admitDate: '2026-08-31', dayOfCare: 3,
            attendingDr: 'Dr. Iyer', primaryNurse: 'Nurse Meera',
            vitals: { hr: 94, spo2: 95, temp: 38.2, respRate: 22, systolicBp: 105, diastolicBp: 68 },
            history: {
                hr: [102, 98, 96, 95, 94, 94, 95, 94],
                spo2: [94, 94, 95, 95, 95, 95, 95, 95],
                temp: [38.5, 38.4, 38.3, 38.2, 38.2, 38.2, 38.2, 38.2]
            },
            consciousness: 'A', supplementalO2: false, spo2Scale: 1,
            roomControls: { lightOn: true, brightness: 50, bedIncline: 20 },
            orders: [
                { id: 'ord-8', category: 'Medication', text: 'Subcutaneous Regular Insulin 6 units with meals', urgency: 'Routine', time: '10:30 AM', status: 'signed' }
            ],
            dictations: [
                { id: 'dict-5', author: 'Dr. Iyer', time: '10:15 AM', text: 'DKA resolution in progress. Anion gap normalized. Transitioning to subcutaneous insulin protocol.' }
            ],
            timeline: [
                { time: '10:30 AM', text: 'Blood glucose checked: 168 mg/dL. SubQ insulin started.' }
            ],
            familyStatus: { text: 'Improving', level: 'good', desc: 'Blood sugar stabilizing. Acidosis resolved.' },
            rounded: false
        },
        {
            id: 6, room: '106', bed: 'A', token: 'LI526A',
            name: 'Lakshmi Iyer', age: 52, gender: 'F',
            diagnosis: 'Hypertensive Crisis', admitDate: '2026-08-29', dayOfCare: 5,
            attendingDr: 'Dr. Menon', primaryNurse: 'Nurse Priya',
            vitals: { hr: 88, spo2: 97, temp: 38.5, respRate: 18, systolicBp: 165, diastolicBp: 100 },
            history: {
                hr: [92, 90, 88, 88, 87, 88, 88, 88],
                spo2: [97, 97, 97, 97, 97, 97, 97, 97],
                temp: [38.2, 38.4, 38.5, 38.5, 38.5, 38.5, 38.5, 38.5]
            },
            consciousness: 'A', supplementalO2: false, spo2Scale: 1,
            roomControls: { lightOn: true, brightness: 70, bedIncline: 30 },
            orders: [
                { id: 'ord-9', category: 'Medication', text: 'Labetalol 20mg IV slow push', urgency: 'URGENT', time: '11:15 AM', status: 'signed' }
            ],
            dictations: [],
            timeline: [
                { time: '11:15 AM', text: 'Labetalol IV administered for SBP 165 mmHg.' }
            ],
            familyStatus: { text: 'Monitored Care', level: 'warn', desc: 'Blood pressure being safely reduced with medication.' },
            rounded: false
        },
        {
            id: 7, room: '107', bed: 'A', token: 'VS637A',
            name: 'Vikram Singh', age: 63, gender: 'M',
            diagnosis: 'Atrial Fibrillation', admitDate: '2026-08-31', dayOfCare: 3,
            attendingDr: 'Dr. Kapoor', primaryNurse: 'Nurse Anjali',
            vitals: { hr: 95, spo2: 97, temp: 36.0, respRate: 16, systolicBp: 125, diastolicBp: 80 },
            history: { hr: [95, 96, 94, 95], spo2: [97, 97, 98, 97], temp: [36.0, 36.0, 36.1, 36.0] },
            consciousness: 'A', supplementalO2: false, spo2Scale: 1,
            roomControls: { lightOn: true, brightness: 80, bedIncline: 10 },
            orders: [], dictations: [], timeline: [],
            familyStatus: { text: 'Stable', level: 'good', desc: 'Heart rate controlled.' }, rounded: false
        },
        {
            id: 8, room: '108', bed: 'A', token: 'DN298A',
            name: 'Deepa Nair', age: 29, gender: 'F',
            diagnosis: 'Severe Asthma Exacerbation', admitDate: '2026-09-01', dayOfCare: 2,
            attendingDr: 'Dr. Rao', primaryNurse: 'Nurse Meera',
            vitals: { hr: 92, spo2: 95, temp: 37.5, respRate: 22, systolicBp: 118, diastolicBp: 75 },
            history: { hr: [96, 94, 92, 92], spo2: [94, 95, 95, 95], temp: [37.5, 37.5, 37.5, 37.5] },
            consciousness: 'A', supplementalO2: true, spo2Scale: 1,
            roomControls: { lightOn: true, brightness: 60, bedIncline: 40 },
            orders: [], dictations: [], timeline: [],
            familyStatus: { text: 'Improving', level: 'good', desc: 'Asthma symptoms resolving on inhaler therapy.' }, rounded: false
        },
        {
            id: 9, room: '109', bed: 'A', token: 'SM789A',
            name: 'Suresh Menon', age: 78, gender: 'M',
            diagnosis: 'Hip Fracture (Post-Op Day 6)', admitDate: '2026-08-27', dayOfCare: 7,
            attendingDr: 'Dr. Shah', primaryNurse: 'Nurse Anjali',
            vitals: { hr: 65, spo2: 97, temp: 35.8, respRate: 14, systolicBp: 130, diastolicBp: 82 },
            history: { hr: [68, 66, 65, 65], spo2: [97, 97, 97, 97], temp: [35.8, 35.8, 35.8, 35.8] },
            consciousness: 'A', supplementalO2: false, spo2Scale: 1,
            roomControls: { lightOn: true, brightness: 70, bedIncline: 10 },
            orders: [], dictations: [], timeline: [],
            familyStatus: { text: 'Stable', level: 'good', desc: 'Physical therapy progressing well post-surgery.' }, rounded: false
        },
        {
            id: 10, room: '110', bed: 'A', token: 'KJ410A',
            name: 'Kavita Joshi', age: 41, gender: 'F',
            diagnosis: 'Acute Pancreatitis', admitDate: '2026-08-30', dayOfCare: 4,
            attendingDr: 'Dr. Iyer', primaryNurse: 'Nurse Priya',
            vitals: { hr: 82, spo2: 96, temp: 37.8, respRate: 16, systolicBp: 105, diastolicBp: 70 },
            history: { hr: [84, 83, 82, 82], spo2: [96, 96, 96, 96], temp: [37.8, 37.8, 37.8, 37.8] },
            consciousness: 'A', supplementalO2: false, spo2Scale: 1,
            roomControls: { lightOn: true, brightness: 50, bedIncline: 25 },
            orders: [], dictations: [], timeline: [],
            familyStatus: { text: 'Stable', level: 'good', desc: 'Abdominal pain improving on bowel rest and IV fluids.' }, rounded: false
        },
        {
            id: 11, room: '111', bed: 'A', token: 'RK551A',
            name: 'Ravi Krishnan', age: 55, gender: 'M',
            diagnosis: 'Sepsis (Recovering)', admitDate: '2026-08-26', dayOfCare: 8,
            attendingDr: 'Dr. Patel', primaryNurse: 'Nurse Meera',
            vitals: { hr: 108, spo2: 95, temp: 38.2, respRate: 21, systolicBp: 115, diastolicBp: 72 },
            history: { hr: [112, 110, 108, 108], spo2: [94, 95, 95, 95], temp: [38.5, 38.3, 38.2, 38.2] },
            consciousness: 'A', supplementalO2: false, spo2Scale: 1,
            roomControls: { lightOn: true, brightness: 60, bedIncline: 30 },
            orders: [], dictations: [], timeline: [],
            familyStatus: { text: 'Recovering', level: 'good', desc: 'Infection markers decreasing, tolerating IV antibiotics.' }, rounded: false
        },
        {
            id: 12, room: '112', bed: 'A', token: 'FB682A',
            name: 'Fatima Begum', age: 68, gender: 'F',
            diagnosis: 'Ischemic Stroke', admitDate: '2026-08-29', dayOfCare: 5,
            attendingDr: 'Dr. Menon', primaryNurse: 'Nurse Anjali',
            vitals: { hr: 48, spo2: 96, temp: 37.0, respRate: 16, systolicBp: 130, diastolicBp: 85 },
            history: { hr: [52, 50, 48, 48], spo2: [96, 96, 96, 96], temp: [37.0, 37.0, 37.0, 37.0] },
            consciousness: 'A', supplementalO2: true, spo2Scale: 1,
            roomControls: { lightOn: true, brightness: 40, bedIncline: 30 },
            orders: [], dictations: [], timeline: [],
            familyStatus: { text: 'Monitored Care', level: 'warn', desc: 'Stroke recovery monitored by neurology team.' }, rounded: false
        }
    ];

    const DEFAULT_NURSE_CALLS = [
        {
            id: 'nc-1', roomId: '102', patientName: 'Priya Reddy',
            type: 'clinical', message: 'Requesting pain assessment — discomfort in chest area',
            createdAt: Date.now() - 225000, status: 'pending'
        },
        {
            id: 'nc-2', roomId: '106', patientName: 'Lakshmi Iyer',
            type: 'comfort', message: 'Water and blanket request',
            createdAt: Date.now() - 82000, status: 'pending'
        },
        {
            id: 'nc-3', roomId: '109', patientName: 'Suresh Menon',
            type: 'comfort', message: 'Requesting help adjusting bed position',
            createdAt: Date.now() - 30000, status: 'pending'
        }
    ];

    // ─── NEWS2 Score Calculator Function ──────────────────────────
    function calculateNEWS2(vitals, consciousness, supplementalO2, spo2Scale) {
        const scores = {};
        const hr = vitals.hr || 75;
        const spo2 = vitals.spo2 || 98;
        const temp = vitals.temp || 36.8;
        const respRate = vitals.respRate || 16;
        const sbp = vitals.systolicBp || 120;

        // Resp Rate
        if (respRate <= 8) scores.respRate = 3;
        else if (respRate <= 11) scores.respRate = 1;
        else if (respRate <= 20) scores.respRate = 0;
        else if (respRate <= 24) scores.respRate = 2;
        else scores.respRate = 3;

        // SpO2
        if (spo2Scale === 2) { // Hypercapnic
            if (spo2 <= 83) scores.spo2 = 3;
            else if (spo2 <= 85) scores.spo2 = 2;
            else if (spo2 <= 87) scores.spo2 = 1;
            else if (spo2 <= 92) scores.spo2 = 0;
            else if (spo2 <= 94) scores.spo2 = 1;
            else if (spo2 <= 96) scores.spo2 = 2;
            else scores.spo2 = 3;
        } else {
            if (spo2 <= 91) scores.spo2 = 3;
            else if (spo2 <= 93) scores.spo2 = 2;
            else if (spo2 <= 95) scores.spo2 = 1;
            else scores.spo2 = 0;
        }

        // Supplemental O2
        scores.supplementalO2 = supplementalO2 ? 2 : 0;

        // Systolic BP
        if (sbp <= 90) scores.systolicBp = 3;
        else if (sbp <= 100) scores.systolicBp = 2;
        else if (sbp <= 110) scores.systolicBp = 1;
        else if (sbp <= 219) scores.systolicBp = 0;
        else scores.systolicBp = 3;

        // Heart Rate
        if (hr <= 40) scores.hr = 3;
        else if (hr <= 50) scores.hr = 1;
        else if (hr <= 90) scores.hr = 0;
        else if (hr <= 110) scores.hr = 1;
        else if (hr <= 130) scores.hr = 2;
        else scores.hr = 3;

        // Temperature
        if (temp <= 35.0) scores.temp = 3;
        else if (temp <= 36.0) scores.temp = 1;
        else if (temp <= 38.0) scores.temp = 0;
        else if (temp <= 39.0) scores.temp = 1;
        else scores.temp = 2;

        // Consciousness
        scores.consciousness = (consciousness === 'A') ? 0 : 3;

        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        const hasSingle3 = Object.values(scores).some(v => v === 3);

        let riskLevel = 'low';
        if (total >= 7) riskLevel = 'high';
        else if (total >= 5) riskLevel = 'medium';
        else if (hasSingle3) riskLevel = 'low-medium';

        return { total, riskLevel, scores, hasSingle3 };
    }

    // ─── Store Initialization ──────────────────────────────
    class SmartHospitalStore {
        constructor() {
            this.listeners = [];
            this.channel = null;

            if ('BroadcastChannel' in window) {
                try {
                    this.channel = new BroadcastChannel(CHANNEL_NAME);
                    this.channel.onmessage = (event) => this._handleRemoteMessage(event.data);
                } catch (e) {
                    console.warn('BroadcastChannel unavailable (file:// origin?):', e.message);
                    this.channel = null;
                }
            }

            window.addEventListener('storage', (e) => {
                if (e.key === STORAGE_KEY && e.newValue) {
                    this._notifyListeners({ type: 'STORAGE_SYNC', state: JSON.parse(e.newValue) });
                }
            });

            this._ensureInitialState();
        }

        _ensureInitialState() {
            const raw = localStorage.getItem(STORAGE_KEY);
            let state = null;

            if (raw) {
                try {
                    state = JSON.parse(raw);
                    // Heal/upgrade state if patients lack token or familyStatus from old localStorage
                    if (state && Array.isArray(state.patients)) {
                        let stateModified = false;
                        state.patients.forEach((p) => {
                            const defaultP = DEFAULT_PATIENTS.find(dp => String(dp.id) === String(p.id) || String(dp.room) === String(p.room));
                            if (defaultP) {
                                if (!p.token) { p.token = defaultP.token; stateModified = true; }
                                if (!p.familyStatus) { p.familyStatus = defaultP.familyStatus; stateModified = true; }
                            }
                        });
                        if (stateModified) {
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                        }
                    }
                } catch (e) {
                    state = null;
                }
            }

            if (!state || !state.patients || state.patients.length === 0) {
                const patients = DEFAULT_PATIENTS.map(p => {
                    p.news2 = calculateNEWS2(p.vitals, p.consciousness, p.supplementalO2, p.spo2Scale);
                    return p;
                });
                const initialState = {
                    patients,
                    nurseCalls: DEFAULT_NURSE_CALLS,
                    familyMessages: [],
                    lastUpdated: Date.now()
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
            }
        }

        _getState() {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                this._ensureInitialState();
                return JSON.parse(localStorage.getItem(STORAGE_KEY));
            }
            return JSON.parse(raw);
        }

        _saveState(state, eventType, payload) {
            state.lastUpdated = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

            const msg = { type: eventType, payload, lastUpdated: state.lastUpdated };
            if (this.channel) {
                try { this.channel.postMessage(msg); } catch (e) { console.error(e); }
            }
            this._notifyListeners(msg);
        }

        _handleRemoteMessage(msg) {
            this._notifyListeners(msg);
        }

        _notifyListeners(msg) {
            this.listeners.forEach(cb => {
                try { cb(msg, this._getState()); } catch (e) { console.error('Listener error:', e); }
            });
        }

        // ─── Public API Methods ─────────────────────────────

        subscribe(callback) {
            this.listeners.push(callback);
            return () => {
                this.listeners = this.listeners.filter(cb => cb !== callback);
            };
        }

        getPatients() {
            return this._getState().patients;
        }

        getPatient(idOrRoom) {
            if (!idOrRoom) return null;
            const query = String(idOrRoom).trim().toUpperCase();
            const patients = this.getPatients();
            return patients.find(p => 
                String(p.id).trim().toUpperCase() === query || 
                String(p.room).trim().toUpperCase() === query || 
                (p.token && String(p.token).trim().toUpperCase() === query)
            );
        }

        getNurseCalls() {
            return this._getState().nurseCalls || [];
        }

        getFamilyMessages() {
            return this._getState().familyMessages || [];
        }

        // Update Vitals (simulated or real telemetry)
        updatePatientVitals(roomId, vitalsUpdate) {
            const state = this._getState();
            const pIndex = state.patients.findIndex(p => p.room === String(roomId));
            if (pIndex === -1) return;

            const p = state.patients[pIndex];
            p.vitals = { ...p.vitals, ...vitalsUpdate };

            // Update sparkline history
            if (vitalsUpdate.hr) {
                p.history.hr.push(vitalsUpdate.hr);
                if (p.history.hr.length > 20) p.history.hr.shift();
            }
            if (vitalsUpdate.spo2) {
                p.history.spo2.push(vitalsUpdate.spo2);
                if (p.history.spo2.length > 20) p.history.spo2.shift();
            }
            if (vitalsUpdate.temp) {
                p.history.temp.push(vitalsUpdate.temp);
                if (p.history.temp.length > 20) p.history.temp.shift();
            }

            // Recalculate NEWS2
            p.news2 = calculateNEWS2(p.vitals, p.consciousness, p.supplementalO2, p.spo2Scale);

            // Update plain-language status
            if (p.news2.riskLevel === 'high') {
                p.familyStatus = { text: 'Receiving Intensive Monitoring', level: 'alert', desc: 'Care team actively providing continuous attention.' };
            } else if (p.news2.riskLevel === 'medium' || p.news2.riskLevel === 'low-medium') {
                p.familyStatus = { text: 'Stable under observation', level: 'warn', desc: 'Vitals being monitored regularly by nursing staff.' };
            } else {
                p.familyStatus = { text: 'Resting & Stable', level: 'good', desc: 'Patient is comfortable and recovering well.' };
            }

            this._saveState(state, 'VITALS_UPDATED', { roomId, vitals: p.vitals, news2: p.news2 });
        }

        // Batch update all vitals (Nurse Station tick)
        batchUpdateVitals(vitalsMap) {
            const state = this._getState();
            let updated = false;

            state.patients.forEach(p => {
                if (vitalsMap[p.room]) {
                    const newV = vitalsMap[p.room];
                    p.vitals = { ...p.vitals, ...newV };
                    if (newV.hr) { p.history.hr.push(newV.hr); if (p.history.hr.length > 15) p.history.hr.shift(); }
                    if (newV.spo2) { p.history.spo2.push(newV.spo2); if (p.history.spo2.length > 15) p.history.spo2.shift(); }
                    if (newV.temp) { p.history.temp.push(newV.temp); if (p.history.temp.length > 15) p.history.temp.shift(); }

                    p.news2 = calculateNEWS2(p.vitals, p.consciousness, p.supplementalO2, p.spo2Scale);
                    updated = true;
                }
            });

            if (updated) {
                this._saveState(state, 'BATCH_VITALS_UPDATED', {});
            }
        }

        // Update Manual Vitals (BP, Consciousness, Supplemental O2, SpO2 scale)
        updateManualVitals(roomId, manualData) {
            const state = this._getState();
            const p = state.patients.find(p => p.room === String(roomId));
            if (!p) return;

            if (manualData.systolicBp !== undefined) p.vitals.systolicBp = parseInt(manualData.systolicBp);
            if (manualData.diastolicBp !== undefined) p.vitals.diastolicBp = parseInt(manualData.diastolicBp);
            if (manualData.consciousness !== undefined) p.consciousness = manualData.consciousness;
            if (manualData.supplementalO2 !== undefined) p.supplementalO2 = Boolean(manualData.supplementalO2);
            if (manualData.spo2Scale !== undefined) p.spo2Scale = parseInt(manualData.spo2Scale);

            p.news2 = calculateNEWS2(p.vitals, p.consciousness, p.supplementalO2, p.spo2Scale);
            this._saveState(state, 'MANUAL_VITALS_UPDATED', { roomId, patient: p });
        }

        // Nurse Calls Management
        addNurseCall(roomId, type = 'clinical', message = 'Nurse call requested') {
            const state = this._getState();
            const p = state.patients.find(p => p.room === String(roomId));
            const patientName = p ? p.name : `Room ${roomId}`;

            const call = {
                id: 'nc-' + Date.now(),
                roomId: String(roomId),
                patientName,
                type,
                message,
                createdAt: Date.now(),
                status: 'pending'
            };

            state.nurseCalls = [call, ...(state.nurseCalls || [])];
            this._saveState(state, 'NURSE_CALL_CREATED', { call });
            return call;
        }

        acknowledgeNurseCall(callId, nurseName = 'Nurse Priya') {
            const state = this._getState();
            const call = (state.nurseCalls || []).find(c => c.id === callId);
            if (call) {
                call.status = 'acknowledged';
                call.acknowledgedAt = Date.now();
                call.acknowledgedBy = nurseName;
                this._saveState(state, 'NURSE_CALL_ACKNOWLEDGED', { call });
            }
        }

        resolveNurseCall(callId) {
            const state = this._getState();
            state.nurseCalls = (state.nurseCalls || []).filter(c => c.id !== callId);
            this._saveState(state, 'NURSE_CALL_RESOLVED', { callId });
        }

        // Room Controls
        setRoomControls(roomId, controls) {
            const state = this._getState();
            const p = state.patients.find(p => p.room === String(roomId));
            if (!p) return;

            p.roomControls = { ...p.roomControls, ...controls };
            this._saveState(state, 'ROOM_CONTROL_CHANGED', { roomId, controls: p.roomControls });
        }

        // Doctor Orders
        addDoctorOrder(roomId, category, text, urgency = 'Routine') {
            const state = this._getState();
            const p = state.patients.find(p => p.room === String(roomId));
            if (!p) return;

            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const order = {
                id: 'ord-' + Date.now(),
                category,
                text,
                urgency,
                time: timeStr,
                status: 'signed'
            };

            p.orders = [order, ...(p.orders || [])];
            p.timeline = [{ time: timeStr, text: `New Order (${urgency}): ${text}` }, ...(p.timeline || [])];

            this._saveState(state, 'ORDER_ADDED', { roomId, order });
            return order;
        }

        // Doctor Dictations & Notes
        addDoctorDictation(roomId, author, text) {
            const state = this._getState();
            const p = state.patients.find(p => p.room === String(roomId));
            if (!p) return;

            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dictation = {
                id: 'dict-' + Date.now(),
                author: author || 'Dr. Patel',
                time: timeStr,
                text
            };

            p.dictations = [dictation, ...(p.dictations || [])];
            p.timeline = [{ time: timeStr, text: `Rounds Note by ${author}: "${text.slice(0, 60)}..."` }, ...(p.timeline || [])];
            p.rounded = true;

            this._saveState(state, 'DICTATION_ADDED', { roomId, dictation });
            return dictation;
        }

        // Family Messages
        sendFamilyMessage(roomId, familyName, text) {
            const state = this._getState();
            const p = state.patients.find(p => p.room === String(roomId));
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const familyMsg = {
                id: 'fmsg-' + Date.now(),
                roomId: String(roomId),
                patientName: p ? p.name : `Room ${roomId}`,
                familyName: familyName || 'Family Member',
                text,
                createdAt: Date.now(),
                time: timeStr
            };

            state.familyMessages = [familyMsg, ...(state.familyMessages || [])];
            
            // Also create a nurse call so it pops up in nurse station
            this.addNurseCall(roomId, 'comfort', `Message from ${familyName}: "${text}"`);
            
            this._saveState(state, 'FAMILY_MESSAGE_SENT', { familyMsg });
            return familyMsg;
        }

        // Toggle Rounded Status
        togglePatientRounded(roomId) {
            const state = this._getState();
            const p = state.patients.find(p => p.room === String(roomId));
            if (p) {
                p.rounded = !p.rounded;
                this._saveState(state, 'ROUNDED_TOGGLED', { roomId, rounded: p.rounded });
            }
        }

        // Reset state to initial defaults
        resetState() {
            localStorage.removeItem(STORAGE_KEY);
            this._ensureInitialState();
            this._notifyListeners({ type: 'STATE_RESET', state: this._getState() });
        }
    }

    // Export singleton to global window
    window.SmartHospitalStore = new SmartHospitalStore();

})(window);
