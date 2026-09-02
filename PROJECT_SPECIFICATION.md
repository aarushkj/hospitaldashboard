# 🏥 AI-Powered Smart Hospital Room — Project Specification

> **Version:** 1.0  
> **Date:** 2026-09-02  
> **Status:** Draft  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Hardware Requirements & Specifications](#3-hardware-requirements--specifications)
4. [Software Stack & Dependencies](#4-software-stack--dependencies)
5. [IoT Biometric Telemetry Pipeline](#5-iot-biometric-telemetry-pipeline)
6. [NEWS2 Early Warning Score Engine](#6-news2-early-warning-score-engine)
7. [Dashboard Specifications](#7-dashboard-specifications)
8. [API & Communication Protocols](#8-api--communication-protocols)
9. [Security & Compliance Considerations](#9-security--compliance-considerations)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Bill of Materials (BOM)](#11-bill-of-materials-bom)
12. [Glossary](#12-glossary)

---

## 1. Executive Summary

The **AI-Powered Smart Hospital Room** is an integrated IoT and Edge AI healthcare ecosystem designed to modernize inpatient care. It replaces manual periodic vitals charting with **continuous non-invasive telemetry**, provides **proactive clinical early-warning alerts**, and delivers **synchronized multi-role dashboards** for patients, nurses, doctors, and family members.

### Key Objectives

| Objective | Target Improvement |
|---|---|
| Reduce routine nurse administrative vitals logging | 40–50% reduction |
| Save physician time per patient during rounds | 5–10 minutes saved |
| Reduce family status inquiry calls to nursing station | Up to 60% reduction |
| Enhance patient safety through early deterioration detection | Continuous NEWS2 monitoring |

### Core Pillars

1. **Continuous IoT Biometric Telemetry** — ESP32 microcontrollers with non-invasive sensors stream vitals over MQTT.
2. **Predictive Clinical Early Warning (NEWS2)** — Automated National Early Warning Score engine flags risks hours before critical emergencies.
3. **Unified Multi-Role Dashboards** — Four purpose-built interfaces for patients, nurses, doctors, and families.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Bedside Hardware Layer"
        ESP["ESP32 DevKit V1"]
        MAX["MAX30102<br/>HR + SpO₂"]
        MLX["MLX90614<br/>IR Temperature"]
        RELAY["Relay Module<br/>Bed/Lights"]
        MAX -->|I2C 0x57| ESP
        MLX -->|I2C 0x5A| ESP
        ESP -->|GPIO| RELAY
    end

    subgraph "Communication Layer"
        MQTT["Eclipse Mosquitto<br/>MQTT Broker"]
        ESP -->|"MQTT over WiFi<br/>QoS 1"| MQTT
    end

    subgraph "Backend Server Layer"
        API["FastAPI Server<br/>(Python 3.10+)"]
        NEWS["NEWS2 Engine"]
        DB["SQLite / PostgreSQL<br/>Vitals Store"]
        MQTT -->|"Paho MQTT<br/>Subscribe"| API
        API --> NEWS
        API --> DB
    end

    subgraph "Dashboard Layer"
        WS["WebSocket Hub"]
        API --> WS
        WS --> D1["Patient Bedside<br/>Terminal"]
        WS --> D2["Nurse Command<br/>Station"]
        WS --> D3["Doctor Rounds<br/>App"]
        WS --> D4["Family Portal"]
    end

    style ESP fill:#1a1a2e,stroke:#e94560,color:#fff
    style MQTT fill:#0f3460,stroke:#e94560,color:#fff
    style API fill:#16213e,stroke:#0f3460,color:#fff
    style NEWS fill:#533483,stroke:#e94560,color:#fff
    style DB fill:#16213e,stroke:#0f3460,color:#fff
```

### 2.2 Data Flow Sequence

```mermaid
sequenceDiagram
    participant S as ESP32 Sensors
    participant M as MQTT Broker
    participant B as FastAPI Backend
    participant N as NEWS2 Engine
    participant D as Dashboards

    loop Every 1–5 seconds
        S->>M: Publish vitals JSON<br/>topic: hospital/ward/room/bed/vitals
        M->>B: Forward to subscriber
        B->>N: Calculate NEWS2 score
        N-->>B: Return score + risk level
        B->>B: Store in database
        B->>D: Push via WebSocket
    end

    Note over N,D: If NEWS2 ≥ 5, trigger alert
    N->>B: HIGH RISK alert
    B->>D: Emergency notification<br/>(sound + visual)
```

### 2.3 Network Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                     Hospital Ward Network                        │
│                        (VLAN: IoT)                               │
│                                                                  │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│   │ Room 101 │   │ Room 102 │   │ Room 103 │   │ Room 104 │    │
│   │  ESP32   │   │  ESP32   │   │  ESP32   │   │  ESP32   │    │
│   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘    │
│        │              │              │              │            │
│        └──────────────┴──────┬───────┴──────────────┘            │
│                              │                                   │
│                     ┌────────▼────────┐                          │
│                     │  WiFi Access    │                          │
│                     │  Point (WPA2)   │                          │
│                     └────────┬────────┘                          │
│                              │                                   │
│                     ┌────────▼────────┐                          │
│                     │   Mosquitto     │                          │
│                     │  MQTT Broker    │                          │
│                     │  Port: 1883     │                          │
│                     │  TLS: 8883      │                          │
│                     └────────┬────────┘                          │
│                              │                                   │
│                     ┌────────▼────────┐                          │
│                     │  FastAPI Server │                          │
│                     │  Port: 8000     │                          │
│                     │  + WebSocket    │                          │
│                     └────────┬────────┘                          │
│                              │                                   │
│              ┌───────────────┼───────────────┐                   │
│              │               │               │                   │
│     ┌────────▼──┐   ┌───────▼───┐   ┌───────▼───┐              │
│     │  Nurse    │   │  Doctor   │   │  Family   │              │
│     │  Station  │   │  Rounds   │   │  Portal   │              │
│     │  (LAN)    │   │  (WiFi)   │   │ (Internet)│              │
│     └───────────┘   └───────────┘   └───────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Hardware Requirements & Specifications

### 3.1 ESP32 DevKit V1

The ESP32 serves as the bedside sensor hub, reading non-invasive biometric data and publishing it to the MQTT broker over WiFi.

| Specification | Detail |
|---|---|
| **MCU** | Espressif ESP32-WROOM-32 (Dual-core Xtensa LX6, 240 MHz) |
| **Flash** | 4 MB |
| **RAM** | 520 KB SRAM |
| **WiFi** | 802.11 b/g/n (2.4 GHz) |
| **Bluetooth** | BLE 4.2 (unused in this project) |
| **I2C Pins** | SDA: GPIO 21, SCL: GPIO 22 |
| **Operating Voltage** | 3.3V logic (5V USB power input) |
| **Power Consumption** | ~80 mA active WiFi, ~10 µA deep sleep |

### 3.2 MAX30102 — Pulse Oximeter & Heart Rate Sensor

A reflective optical sensor that uses red and infrared LEDs to measure blood oxygen saturation (SpO₂) and heart rate through photoplethysmography (PPG).

| Specification | Detail |
|---|---|
| **Interface** | I2C (address: `0x57`) |
| **Supply Voltage** | 1.8V (core), 3.3V (LED) |
| **Measurement** | SpO₂ (%) and Heart Rate (BPM) |
| **LED Wavelengths** | Red: 660nm, IR: 880nm |
| **Sample Rate** | Configurable: 50–3200 samples/sec |
| **ADC Resolution** | 18-bit |
| **Recommended Library** | `SparkFun MAX3010x Pulse and Proximity Sensor` |

**Wiring to ESP32:**

| MAX30102 Pin | ESP32 Pin | Notes |
|---|---|---|
| VIN | 3.3V | ⚠️ Check 3V3 jumper on breakout board |
| GND | GND | Common ground |
| SDA | GPIO 21 | I2C Data |
| SCL | GPIO 22 | I2C Clock |
| INT | GPIO 19 (optional) | Interrupt for new data ready |

**Key Consideration:** Many MAX30102 breakout boards ship configured for 1.8V logic. A solder jumper on the back (usually labeled "3V3") must be bridged to operate at 3.3V with the ESP32.

### 3.3 MLX90614 — Infrared Contactless Temperature Sensor

A medical-grade infrared thermometer that measures surface temperature without physical contact, ideal for continuous non-invasive body temperature monitoring.

| Specification | Detail |
|---|---|
| **Interface** | I2C / SMBus (address: `0x5A`) |
| **Supply Voltage** | 3.3V |
| **Object Temperature Range** | -70°C to +382.2°C |
| **Medical Accuracy** | ±0.2°C in 36–39°C range |
| **Field of View** | 90° (standard) / 5° (medical-grade narrow FOV) |
| **Resolution** | 0.02°C |
| **Recommended Library** | `Adafruit MLX90614` |

**Wiring to ESP32:**

| MLX90614 Pin | ESP32 Pin | Notes |
|---|---|---|
| VIN | 3.3V | 3.3V supply |
| GND | GND | Common ground |
| SDA | GPIO 21 | I2C Data (shared bus) |
| SCL | GPIO 22 | I2C Clock (shared bus) |

### 3.4 Relay Module (Room Comfort Controls)

A 2-channel or 4-channel relay module for controlling room amenities (lights, motorized bed incline).

| Specification | Detail |
|---|---|
| **Channels** | 2–4 (one per controlled device) |
| **Trigger Voltage** | 3.3V compatible (active LOW) |
| **Switching** | Up to 250VAC / 10A per channel |
| **Isolation** | Optocoupler isolated |

**Relay Channel Assignment:**

| Channel | Device | ESP32 GPIO | MQTT Control Topic |
|---|---|---|---|
| 1 | Room Light (ON/OFF) | GPIO 25 | `hospital/{ward}/{room}/control/light` |
| 2 | Room Light (Dimmer via PWM) | GPIO 26 | `hospital/{ward}/{room}/control/light_dim` |
| 3 | Bed Incline Motor (UP) | GPIO 27 | `hospital/{ward}/{room}/control/bed_up` |
| 4 | Bed Incline Motor (DOWN) | GPIO 14 | `hospital/{ward}/{room}/control/bed_down` |

### 3.5 Complete Wiring Diagram

```
                        ┌─────────────────────────────┐
                        │       ESP32 DevKit V1        │
                        │                              │
    ┌───────────┐       │   3.3V ●────────────┐       │       ┌───────────┐
    │  MAX30102 │       │                      │       │       │  MLX90614 │
    │           │       │   GND  ●──────────┐  │       │       │           │
    │  VIN ─────┼───────┼── 3.3V             │  │       │───────┼── VIN     │
    │  GND ─────┼───────┼── GND              │  │       │───────┼── GND     │
    │  SDA ─────┼───────┼── GPIO 21 (SDA) ───┼──┼───────┼───────┼── SDA     │
    │  SCL ─────┼───────┼── GPIO 22 (SCL) ───┼──┼───────┼───────┼── SCL     │
    │  INT ─────┼───────┼── GPIO 19          │  │       │       │           │
    └───────────┘       │                      │  │       │       └───────────┘
                        │                      │  │       │
                        │   GPIO 25 ──────────┼──┼───────┼──── Relay CH1 (Light)
                        │   GPIO 26 ──────────┼──┼───────┼──── Relay CH2 (Dimmer)
                        │   GPIO 27 ──────────┼──┼───────┼──── Relay CH3 (Bed Up)
                        │   GPIO 14 ──────────┼──┼───────┼──── Relay CH4 (Bed Down)
                        │                      │  │       │
                        └─────────────────────────────┘
                                               │  │
                                              GND 3.3V
                                           (Common Bus)
```

> ⚠️ **I2C Bus Note:** Both MAX30102 and MLX90614 share the same I2C bus (GPIO 21/22). The firmware must toggle clock speeds: **100 kHz for MAX30102** and **50 kHz for MLX90614** to ensure reliable communication.

---

## 4. Software Stack & Dependencies

### 4.1 ESP32 Firmware

| Component | Technology | Version |
|---|---|---|
| **IDE** | Arduino IDE or PlatformIO (VSCode) | Arduino IDE 2.x / PlatformIO 6.x |
| **Board Package** | `esp32` by Espressif Systems | ≥ 2.0.14 |
| **Heart Rate / SpO₂** | `SparkFun MAX3010x Pulse and Proximity Sensor` | ≥ 1.1.2 |
| **Temperature** | `Adafruit MLX90614 Library` | ≥ 2.1.5 |
| **MQTT Client** | `PubSubClient` | ≥ 2.8 |
| **JSON Serialization** | `ArduinoJson` | ≥ 7.x |
| **WiFi** | Built-in `WiFi.h` | — |
| **I2C** | Built-in `Wire.h` | — |

### 4.2 Backend Server

| Component | Technology | Version |
|---|---|---|
| **Runtime** | Python | ≥ 3.10 |
| **Web Framework** | FastAPI | ≥ 0.100 |
| **ASGI Server** | Uvicorn | ≥ 0.23 |
| **MQTT Client** | Paho MQTT (asyncio) | ≥ 2.0 |
| **Database ORM** | SQLAlchemy (async) | ≥ 2.0 |
| **Database** | SQLite (dev) / PostgreSQL (prod) | — |
| **Data Validation** | Pydantic | ≥ 2.0 |
| **WebSocket** | FastAPI native WebSocket | — |
| **Task Scheduling** | APScheduler | ≥ 3.10 |
| **CORS** | FastAPI CORSMiddleware | — |

**`requirements.txt`:**

```
fastapi>=0.100.0
uvicorn[standard]>=0.23.0
paho-mqtt>=2.0.0
sqlalchemy[asyncio]>=2.0.0
aiosqlite>=0.19.0
pydantic>=2.0.0
apscheduler>=3.10.0
python-multipart>=0.0.6
passlib>=1.7.4
python-jose[cryptography]>=3.3.0
```

### 4.3 MQTT Broker

| Component | Technology | Version |
|---|---|---|
| **Broker** | Eclipse Mosquitto | ≥ 2.0 |
| **Default Port** | 1883 (plaintext) / 8883 (TLS) | — |
| **WebSocket Port** | 9001 (for browser-based MQTT if needed) | — |
| **Config Location** | `/etc/mosquitto/mosquitto.conf` | — |

### 4.4 Web Dashboards

| Component | Technology |
|---|---|
| **Structure** | HTML5 (semantic) |
| **Styling** | Vanilla CSS3 (custom properties, flexbox, grid) |
| **Logic** | Vanilla JavaScript (ES2022+, modules) |
| **Real-Time** | WebSocket API (native browser) |
| **Charts** | Chart.js (lightweight) or inline SVG sparklines |
| **Voice Input** | Web Speech API (SpeechRecognition) |
| **Fonts** | Google Fonts (Inter, JetBrains Mono) |
| **Icons** | Lucide Icons (SVG inline) |

---

## 5. IoT Biometric Telemetry Pipeline

### 5.1 Firmware Architecture

The ESP32 firmware follows a state-machine architecture with three primary phases:

```mermaid
stateDiagram-v2
    [*] --> Boot
    Boot --> WiFiConnect: Initialize Serial + I2C
    WiFiConnect --> MQTTConnect: WiFi connected
    WiFiConnect --> WiFiConnect: Retry (5s delay)
    MQTTConnect --> SensorLoop: MQTT connected
    MQTTConnect --> WiFiConnect: Connection failed
    
    state SensorLoop {
        [*] --> ReadMAX30102
        ReadMAX30102 --> ReadMLX90614: HR + SpO₂ ready
        ReadMLX90614 --> SerializeJSON: Temperature ready
        SerializeJSON --> PublishMQTT: JSON payload built
        PublishMQTT --> CheckCommands: Published
        CheckCommands --> ReadMAX30102: Loop delay (1s)
    }
    
    SensorLoop --> MQTTConnect: Connection lost
    SensorLoop --> WiFiConnect: WiFi lost
```

### 5.2 Firmware Pseudocode

```cpp
// === CONFIGURATION ===
const char* WIFI_SSID     = "HospitalIoT";
const char* WIFI_PASSWORD  = "********";
const char* MQTT_BROKER    = "192.168.1.100";
const int   MQTT_PORT      = 1883;
const char* WARD_ID        = "cardiology";
const char* ROOM_ID        = "101";
const char* BED_ID         = "A";

// Derived MQTT topics
String TOPIC_VITALS  = "hospital/" + String(WARD_ID) + "/" + String(ROOM_ID) + "/" + String(BED_ID) + "/vitals";
String TOPIC_CONTROL = "hospital/" + String(WARD_ID) + "/" + String(ROOM_ID) + "/control/#";

// === SETUP ===
void setup() {
    Serial.begin(115200);
    Wire.begin(21, 22);          // I2C: SDA=21, SCL=22
    
    initMAX30102();              // Initialize pulse oximeter
    initMLX90614();              // Initialize IR thermometer
    initRelays();                // Set relay GPIOs as OUTPUT
    
    connectWiFi();               // Block until WiFi connected
    connectMQTT();               // Block until MQTT connected
    
    // Subscribe to control topics for room automation
    mqttClient.subscribe(TOPIC_CONTROL.c_str());
}

// === MAIN LOOP ===
void loop() {
    if (!mqttClient.connected()) reconnectMQTT();
    mqttClient.loop();           // Process incoming MQTT messages
    
    // Read sensors (non-blocking, uses millis() timing)
    if (millis() - lastVitalRead >= 1000) {
        Wire.setClock(100000);   // 100kHz for MAX30102
        readHeartRateSpO2();
        
        Wire.setClock(50000);    // 50kHz for MLX90614 
        readTemperature();
        
        // Build and publish JSON
        publishVitals();
        lastVitalRead = millis();
    }
}
```

### 5.3 MQTT Topic Schema

All MQTT topics follow a hierarchical structure for scalable multi-ward, multi-room deployment:

```
hospital/
├── {ward_id}/
│   ├── {room_id}/
│   │   ├── {bed_id}/
│   │   │   └── vitals              ← Sensor data (publish)
│   │   ├── control/
│   │   │   ├── light               ← Light ON/OFF (subscribe)
│   │   │   ├── light_dim           ← Light brightness 0–100 (subscribe)
│   │   │   ├── bed_up              ← Bed incline up (subscribe)
│   │   │   └── bed_down            ← Bed incline down (subscribe)
│   │   └── nurse_call              ← Nurse call request (publish)
│   └── alerts/
│       ├── news2                   ← NEWS2 escalation alerts
│       └── system                  ← System health alerts
```

### 5.4 Vitals Payload Format

Published to `hospital/{ward}/{room}/{bed}/vitals` every 1 second:

```json
{
    "device_id": "ESP32_CARDIOLOGY_101_A",
    "timestamp": "2026-09-02T14:30:00.000Z",
    "vitals": {
        "heart_rate": {
            "value": 72,
            "unit": "bpm",
            "quality": 95
        },
        "spo2": {
            "value": 98,
            "unit": "%",
            "quality": 92
        },
        "temperature": {
            "value": 36.7,
            "unit": "°C",
            "type": "infrared_body"
        }
    },
    "device_status": {
        "battery": null,
        "wifi_rssi": -45,
        "uptime_seconds": 86400
    }
}
```

> **Field Notes:**
> - `quality` (0–100): Signal quality indicator from MAX30102. Values below 50 indicate unreliable readings (e.g., sensor not on finger).
> - `wifi_rssi`: WiFi signal strength in dBm. Values below -80 dBm may cause intermittent MQTT disconnects.
> - `timestamp`: ISO 8601 format, generated by NTP-synchronized ESP32 clock.

### 5.5 Sampling & Transmission Strategy

| Parameter | Sensor Sampling Rate | MQTT Publish Rate | Rationale |
|---|---|---|---|
| Heart Rate | 100 samples/sec (internal) | Every 1 second | Algorithm needs ~4 sec of samples; publish averaged result |
| SpO₂ | 100 samples/sec (internal) | Every 1 second | Co-sampled with heart rate |
| Temperature | 1 sample/sec | Every 5 seconds | Body temp changes slowly; reduces bandwidth |

### 5.6 Reconnection & Reliability Strategy

```
WiFi Reconnection:
├── Attempt 1:  Immediate retry
├── Attempt 2:  Wait 1 second
├── Attempt 3:  Wait 2 seconds
├── Attempt 4:  Wait 4 seconds
├── Attempt 5:  Wait 8 seconds
├── Attempt 6+: Wait 15 seconds (cap)
└── After 30 failures: Hard reboot (ESP.restart())

MQTT Reconnection:
├── Follows same exponential backoff
├── Uses Clean Session = false (resume subscriptions)
├── QoS Level 1 for vitals (at-least-once delivery)
└── Last Will & Testament (LWT):
    Topic: hospital/{ward}/{room}/{bed}/status
    Payload: {"status": "offline", "last_seen": "<timestamp>"}
```

---

## 6. NEWS2 Early Warning Score Engine

### 6.1 Overview

The **National Early Warning Score 2 (NEWS2)** is a standardized track-and-trigger system developed by the Royal College of Physicians. It evaluates six physiological parameters plus supplemental oxygen status to produce an aggregate score (0–20) indicating the patient's risk of clinical deterioration.

### 6.2 Parameter Scoring Tables

#### 6.2.1 Respiratory Rate (breaths per minute)

| Value | ≤8 | 9–11 | 12–20 | 21–24 | ≥25 |
|---|---|---|---|---|---|
| **Score** | 3 | 1 | 0 | 2 | 3 |

#### 6.2.2 Oxygen Saturation — SpO₂ Scale 1 (%)

*For use with patients NOT at risk of hypercapnic respiratory failure.*

| Value | ≤91 | 92–93 | 94–95 | ≥96 |
|---|---|---|---|---|
| **Score** | 3 | 2 | 1 | 0 |

#### 6.2.3 Oxygen Saturation — SpO₂ Scale 2 (%)

*For use with patients AT RISK of hypercapnic respiratory failure (e.g., COPD). Target range: 88–92%.*

| Value | ≤83 | 84–85 | 86–87 | 88–92 (on air) | 93–94 (on O₂) | 95–96 (on O₂) | ≥97 (on O₂) |
|---|---|---|---|---|---|---|---|
| **Score** | 3 | 2 | 1 | 0 | 1 | 2 | 3 |

#### 6.2.4 Supplemental Oxygen

| Status | Room Air | On Supplemental O₂ |
|---|---|---|
| **Score** | 0 | 2 |

#### 6.2.5 Systolic Blood Pressure (mmHg)

| Value | ≤90 | 91–100 | 101–110 | 111–219 | ≥220 |
|---|---|---|---|---|---|
| **Score** | 3 | 2 | 1 | 0 | 3 |

#### 6.2.6 Pulse / Heart Rate (beats per minute)

| Value | ≤40 | 41–50 | 51–90 | 91–110 | 111–130 | ≥131 |
|---|---|---|---|---|---|---|
| **Score** | 3 | 1 | 0 | 1 | 2 | 3 |

#### 6.2.7 Temperature (°C)

| Value | ≤35.0 | 35.1–36.0 | 36.1–38.0 | 38.1–39.0 | ≥39.1 |
|---|---|---|---|---|---|
| **Score** | 3 | 1 | 0 | 1 | 2 |

#### 6.2.8 Level of Consciousness

| Status | Alert | Confusion, Voice, Pain, or Unresponsive (CVPU) |
|---|---|---|
| **Score** | 0 | 3 |

> **Note:** The consciousness assessment is typically entered manually by nursing staff via the dashboard. All other parameters can be automated through sensor data.

### 6.3 Aggregate Score & Clinical Risk Levels

| Aggregate NEWS2 Score | Clinical Risk | Ward Response | Monitoring Frequency |
|---|---|---|---|
| **0** | Low | Routine care | Every 12 hours |
| **1–4** | Low | Nurse assessment; decide on escalation | Every 4–6 hours |
| **3 in any single parameter** | Low–Medium | Urgent ward-based doctor review | Every 1 hour |
| **5–6** | Medium | Urgent review by doctor or acute team | Every 1 hour |
| **≥7** | High | Emergency critical care team assessment | Continuous monitoring |

### 6.4 Automated vs. Manual Parameters

The system automates as many parameters as possible from sensor data:

| Parameter | Source | Automation Level |
|---|---|---|
| Heart Rate (Pulse) | MAX30102 | ✅ Fully Automated |
| SpO₂ | MAX30102 | ✅ Fully Automated |
| Temperature | MLX90614 | ✅ Fully Automated |
| Respiratory Rate | Derived from PPG waveform analysis | ⚠️ Estimated (algorithm-derived) |
| Systolic Blood Pressure | Manual input or optional BP cuff | ❌ Manual Entry Required |
| Consciousness (AVPU) | Nurse assessment | ❌ Manual Entry Required |
| Supplemental Oxygen | Nurse toggle on dashboard | ❌ Manual Entry Required |

### 6.5 NEWS2 Engine Algorithm (Python)

```python
def calculate_news2(
    respiratory_rate: int,
    spo2: int,
    systolic_bp: int,
    heart_rate: int,
    temperature: float,
    consciousness: str,      # "A" (Alert) or "CVPU"
    on_supplemental_o2: bool,
    spo2_scale: int = 1      # 1 = standard, 2 = hypercapnic
) -> dict:
    """
    Calculate NEWS2 aggregate score and risk level.
    Returns: {
        "total_score": int,
        "parameter_scores": dict,
        "risk_level": str,  # "low", "low-medium", "medium", "high"
        "single_param_trigger": bool  # True if any param scores 3
    }
    """
    scores = {}
    
    # Respiratory Rate
    if respiratory_rate <= 8:       scores["resp_rate"] = 3
    elif respiratory_rate <= 11:    scores["resp_rate"] = 1
    elif respiratory_rate <= 20:    scores["resp_rate"] = 0
    elif respiratory_rate <= 24:    scores["resp_rate"] = 2
    else:                           scores["resp_rate"] = 3
    
    # SpO2 (Scale 1)
    if spo2_scale == 1:
        if spo2 <= 91:             scores["spo2"] = 3
        elif spo2 <= 93:           scores["spo2"] = 2
        elif spo2 <= 95:           scores["spo2"] = 1
        else:                       scores["spo2"] = 0
    
    # Supplemental Oxygen
    scores["supplemental_o2"] = 2 if on_supplemental_o2 else 0
    
    # Systolic Blood Pressure
    if systolic_bp <= 90:          scores["systolic_bp"] = 3
    elif systolic_bp <= 100:       scores["systolic_bp"] = 2
    elif systolic_bp <= 110:       scores["systolic_bp"] = 1
    elif systolic_bp <= 219:       scores["systolic_bp"] = 0
    else:                           scores["systolic_bp"] = 3
    
    # Heart Rate
    if heart_rate <= 40:           scores["heart_rate"] = 3
    elif heart_rate <= 50:         scores["heart_rate"] = 1
    elif heart_rate <= 90:         scores["heart_rate"] = 0
    elif heart_rate <= 110:        scores["heart_rate"] = 1
    elif heart_rate <= 130:        scores["heart_rate"] = 2
    else:                           scores["heart_rate"] = 3
    
    # Temperature
    if temperature <= 35.0:        scores["temperature"] = 3
    elif temperature <= 36.0:      scores["temperature"] = 1
    elif temperature <= 38.0:      scores["temperature"] = 0
    elif temperature <= 39.0:      scores["temperature"] = 1
    else:                           scores["temperature"] = 2
    
    # Consciousness
    scores["consciousness"] = 0 if consciousness == "A" else 3
    
    # Aggregate
    total = sum(scores.values())
    single_param_3 = any(v == 3 for v in scores.values())
    
    # Determine risk level
    if total >= 7:
        risk_level = "high"
    elif total >= 5:
        risk_level = "medium"
    elif single_param_3:
        risk_level = "low-medium"
    else:
        risk_level = "low"
    
    return {
        "total_score": total,
        "parameter_scores": scores,
        "risk_level": risk_level,
        "single_param_trigger": single_param_3
    }
```

### 6.6 Trend Analysis & Predictive Alerts

Beyond point-in-time scoring, the engine monitors **trends** over a rolling 2-hour window:

| Trend Pattern | Alert Type | Description |
|---|---|---|
| NEWS2 increased by ≥3 points in 2 hours | **Rapid Deterioration** | Patient condition worsening faster than expected |
| Heart rate trending upward + temperature rising | **Possible Sepsis** | Early sepsis markers detected |
| SpO₂ declining steadily over 30 minutes | **Respiratory Decompensation** | Progressive oxygenation failure |
| NEWS2 score oscillating (high → low → high) | **Unstable Patient** | Condition not stabilizing despite interventions |

```mermaid
graph LR
    subgraph "Rolling 2-Hour Window"
        A["t-120min<br/>NEWS: 2"] --> B["t-90min<br/>NEWS: 3"]
        B --> C["t-60min<br/>NEWS: 4"]
        C --> D["t-30min<br/>NEWS: 5"]
        D --> E["NOW<br/>NEWS: 6"]
    end
    
    E -->|"Delta = +4 in 2hrs"| F["RAPID DETERIORATION<br/>Alert triggered"]
    
    style F fill:#e74c3c,stroke:#c0392b,color:#fff
```

---

## 7. Dashboard Specifications

### 7.1 Patient Bedside Terminal

**Purpose:** Empowers patients with simplified health information and room controls, reducing nurse call frequency for non-clinical requests.

**Target Device:** 10–14" bedside touchscreen (mounted on articulating arm)

#### Features

| Feature | Description | Priority |
|---|---|---|
| **Vitals Display** | Large-font heart rate, SpO₂, temperature with color-coded status indicators | Critical |
| **Nurse Call Button** | One-touch emergency button with confirmation animation and estimated wait time | Critical |
| **Room Light Control** | ON/OFF toggle + brightness slider (0–100%) | High |
| **Bed Incline Control** | UP/DOWN buttons with hold-to-move behavior | High |
| **Medication Reminders** | Timeline showing upcoming medications with name and time | Medium |
| **Comfort Requests** | Pre-built request cards: blanket, water, pain assessment | Medium |
| **Date/Time/Weather** | Ambient information display | Low |

#### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  🏥 Good Afternoon, Mr. Sharma          Room 101 Bed A  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│   │   ❤️ 72   │  │  🫁 98%  │  │  🌡 36.7° │             │
│   │   BPM    │  │   SpO₂   │  │    °C     │             │
│   │  Normal  │  │  Normal  │  │  Normal   │             │
│   └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
│   ┌─────────────────────────────────────────┐           │
│   │         🔴 CALL NURSE                   │           │
│   │       (Tap and hold for 2 seconds)      │           │
│   └─────────────────────────────────────────┘           │
│                                                          │
│   ┌──────────────────┐  ┌──────────────────┐           │
│   │  💡 Room Lights   │  │  🛏️ Bed Incline  │           │
│   │  ○ OFF  ● ON     │  │   [↑]    [↓]     │           │
│   │  ────●─────      │  │  Current: 30°    │           │
│   └──────────────────┘  └──────────────────┘           │
│                                                          │
│   📋 Next Medication: Paracetamol 500mg @ 3:00 PM       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 7.2 Nurse Command Station

**Purpose:** Central triage interface for monitoring all patients across a ward, prioritizing attention based on clinical acuity and pending requests.

**Target Device:** Desktop monitor (21–27") at nursing station

#### Features

| Feature | Description | Priority |
|---|---|---|
| **Multi-Room Grid** | 4-column grid of room cards showing live vitals and NEWS2 score | Critical |
| **Color-Coded Risk** | Cards colored by NEWS2 risk: 🟢 Green (Low), 🟡 Amber (Medium), 🔴 Red (High) | Critical |
| **Alert Overlay** | Full-screen modal for critical alerts (NEWS ≥7) with acknowledge button | Critical |
| **Nurse Call Queue** | Chronological list of pending nurse calls with response timer (SLA tracking) | Critical |
| **Patient Drill-Down** | Click a room card to see detailed vitals, trends, and history | High |
| **Vital Trend Charts** | Sparkline charts showing 4-hour vital sign trends per patient | High |
| **Shift Summary** | Aggregate ward statistics: total patients, alerts resolved, average response time | Medium |
| **Staff Assignment** | Map of which nurse is assigned to which rooms | Medium |

#### UI Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  🏥 Nurse Station — Cardiology Ward          ⏰ 14:30  👤 Nurse Priya │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌── CRITICAL ALERTS (1) ──────────────────────────────────────────┐ │
│  │  🔴 Room 103 Bed B — NEWS: 8 — Rapid deterioration detected     │ │
│  │     HR: 132 bpm ↑  |  SpO₂: 89% ↓  |  Temp: 39.2°C ↑          │ │
│  │     [ACKNOWLEDGE]  [VIEW PATIENT]  [CALL DOCTOR]                 │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Ward Overview (12 Patients)                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ Room 101  │ │ Room 102  │ │ Room 103  │ │ Room 104  │               │
│  │ 🟢 NEWS:1 │ │ 🟡 NEWS:5 │ │ 🔴 NEWS:8 │ │ 🟢 NEWS:2 │               │
│  │ HR:  72   │ │ HR:  95   │ │ HR: 132   │ │ HR:  68   │               │
│  │ SpO₂:98%  │ │ SpO₂:94%  │ │ SpO₂:89%  │ │ SpO₂:97%  │               │
│  │ Temp:36.7 │ │ Temp:37.8 │ │ Temp:39.2 │ │ Temp:36.4 │               │
│  │ ▁▂▃▂▁▂▃  │ │ ▃▄▅▆▇▆▇  │ │ ▅▆▇█▇█▉  │ │ ▁▁▂▁▁▂▁  │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                       │
│  ┌── NURSE CALLS ──────────────────────────────────────────────────┐ │
│  │  ⏱ 0:45  Room 102 — "Need pain assessment"     [RESPOND]       │ │
│  │  ⏱ 2:12  Room 106 — "Water request"             [RESPOND]       │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

#### Response Timer SLA Targets

| Request Type | Target Response Time | Escalation Trigger |
|---|---|---|
| Emergency Call | ≤ 2 minutes | Auto-escalate to charge nurse at 3 min |
| Clinical Request | ≤ 5 minutes | Visual warning at 5 min, escalate at 10 min |
| Comfort Request | ≤ 15 minutes | Visual warning at 15 min |

---

### 7.3 Doctor Rounds App

**Purpose:** Mobile-optimized tool for bedside rounding that eliminates double-entry charting through voice dictation and digital order sign-off.

**Target Device:** Mobile phone or tablet (responsive design)

#### Features

| Feature | Description | Priority |
|---|---|---|
| **Patient Summary Cards** | Compact cards with diagnosis, vitals snapshot, and NEWS2 score | Critical |
| **Vital Trend Sparklines** | Inline mini-charts showing 24-hour trends for key vitals | Critical |
| **Voice-to-Text Dictation** | Web Speech API-powered dictation panel for clinical notes | Critical |
| **Digital Order Entry** | Searchable form for medications, labs, imaging with e-sign | Critical |
| **Rounds Checklist** | Toggleable checklist items with auto-timestamp on completion | High |
| **Patient History Timeline** | Chronological timeline of events, orders, and notes | High |
| **Handoff Notes** | Structured template for shift-change handoff documentation | Medium |

#### UI Layout (Mobile)

```
┌─────────────────────────────────┐
│  👨‍⚕️ Dr. Patel — Rounds         │
│  Cardiology Ward                │
│  Progress: 3/12 patients        │
│  ━━━━━━━━━━━○─────────────────  │
├─────────────────────────────────┤
│                                  │
│  ┌─ Room 103 Bed B ────────┐   │
│  │ Rajesh Kumar, 67M        │   │
│  │ Dx: Pneumonia (CAP)      │   │
│  │ Day 3 of admission       │   │
│  │                          │   │
│  │ 🔴 NEWS: 8 (HIGH)        │   │
│  │ HR: 132 ▅▆▇█▇█▉↑        │   │
│  │ SpO₂: 89% ▇▆▅▄▃▂▁↓     │   │
│  │ Temp: 39.2°C ▃▄▅▆▇↑     │   │
│  │ BP: 95/60 ▅▄▃▃▂↓        │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌─ Clinical Notes ─────────┐   │
│  │ 🎙️ [TAP TO DICTATE]      │   │
│  │                          │   │
│  │ "Patient showing signs   │   │
│  │  of respiratory distress.│   │
│  │  Increasing O2 to 4L     │   │
│  │  via nasal cannula..."   │   │
│  │                          │   │
│  │ [SAVE NOTE] [DISCARD]    │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌─ Orders ──────────────────┐   │
│  │ + New Order               │   │
│  │ ☑ CBC with diff — STAT    │   │
│  │ ☑ Chest X-ray — URGENT    │   │
│  │ ☐ Escalate to ICU consult │   │
│  │                          │   │
│  │ [SIGN & SUBMIT ORDERS]    │   │
│  │ 🔒 Digital signature      │   │
│  └──────────────────────────┘   │
│                                  │
│  [← PREV PATIENT] [NEXT →]     │
│                                  │
└─────────────────────────────────┘
```

#### Voice Dictation Technical Details

```javascript
// Web Speech API implementation
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-IN';  // Indian English

recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
    }
    // Display interim results in real-time
    dictationPanel.textContent = transcript;
};
```

---

### 7.4 Bystander & Family Portal

**Purpose:** Reduces family anxiety and nursing station call volume by providing authorized family members with structured, plain-language recovery updates.

**Target Device:** Any browser (mobile-optimized)

#### Features

| Feature | Description | Priority |
|---|---|---|
| **Token Authentication** | 6-digit alphanumeric code (e.g., `HK3M9X`) with configurable expiry | Critical |
| **Recovery Status Card** | Large, plain-language status: "Stable and improving" with progress indicator | Critical |
| **Simplified Vitals** | Descriptive (not numeric): "Heart rate is normal", "Oxygen levels are good" | Critical |
| **Care Team Info** | Attending physician name, primary nurse, and contact info | High |
| **Visiting Hours** | Schedule display with any restrictions | High |
| **Message to Nurse** | Text message form (subject + body) sent to nurse dashboard | High |
| **Activity Timeline** | Simplified log: "Completed morning assessment", "Medication given" | Medium |
| **FAQ Section** | Common questions about the ward, policies, and condition types | Low |

#### Token Authentication Flow

```mermaid
sequenceDiagram
    participant F as Family Member
    participant P as Family Portal
    participant A as FastAPI Backend
    participant D as Database

    F->>P: Enter access token (e.g., HK3M9X)
    P->>A: POST /api/family/auth {token: "HK3M9X"}
    A->>D: Lookup token - patient_id, permissions, expiry
    
    alt Token Valid
        D-->>A: Patient data + permissions
        A-->>P: 200 OK + session JWT (24hr expiry)
        P->>F: Display recovery dashboard
    else Token Expired
        D-->>A: Token expired
        A-->>P: 401 Unauthorized
        P->>F: "Token expired. Contact nurse station."
    else Token Invalid
        A-->>P: 404 Not Found
        P->>F: "Invalid token. Check your code."
    end
```

#### Plain-Language Vitals Mapping

The portal translates clinical values into reassuring, understandable language:

| Clinical Parameter | Value Range | Plain-Language Display | Icon |
|---|---|---|---|
| Heart Rate | 60–100 bpm | "Heart rate is **normal**" | 💚 |
| Heart Rate | 40–59 or 101–130 bpm | "Heart rate is **slightly outside normal range**" | 🟡 |
| Heart Rate | <40 or >130 bpm | "Heart rate is **being closely monitored**" | 🔴 |
| SpO₂ | ≥96% | "Oxygen levels are **good**" | 💚 |
| SpO₂ | 92–95% | "Oxygen levels are **slightly low**, being monitored" | 🟡 |
| SpO₂ | <92% | "Oxygen levels are **receiving attention**" | 🔴 |
| Temperature | 36.1–38.0°C | "Temperature is **normal**" | 💚 |
| Temperature | 35.1–36.0 or 38.1–39.0°C | "Temperature is **slightly outside normal range**" | 🟡 |
| Temperature | ≤35.0 or ≥39.1°C | "Temperature is **being closely monitored**" | 🔴 |

> **Design Principle:** The family portal NEVER displays raw numerical values. All vitals are described in qualitative terms to prevent misinterpretation and anxiety. Critical details remain visible only to clinical staff.

#### UI Layout

```
┌──────────────────────────────────┐
│  🏥 Smart Hospital               │
│  Family Portal                   │
├──────────────────────────────────┤
│                                   │
│  Patient: R. Kumar               │
│  Room: 103 | Admitted: Aug 30    │
│                                   │
│  ┌──────────────────────────┐    │
│  │   Recovery Status         │    │
│  │                          │    │
│  │   🟡 Stable — Improving   │    │
│  │                          │    │
│  │   ━━━━━━━━━●──────────   │    │
│  │   Admitted    Today  Goal │    │
│  └──────────────────────────┘    │
│                                   │
│  Today's Health Summary           │
│  ┌──────────────────────────┐    │
│  │ 💚 Heart rate is normal    │    │
│  │ 🟡 Oxygen levels slightly │    │
│  │    low, being monitored   │    │
│  │ 💚 Temperature is normal   │    │
│  └──────────────────────────┘    │
│                                   │
│  Care Team                        │
│  👨‍⚕️ Dr. Patel (Attending)        │
│  👩‍⚕️ Nurse Priya (Primary)        │
│                                   │
│  🕐 Visiting Hours: 10AM–8PM     │
│                                   │
│  [📩 Send Message to Nurse]       │
│                                   │
└──────────────────────────────────┘
```

---

## 8. API & Communication Protocols

### 8.1 REST API Endpoints (FastAPI)

#### Room & Vitals Management

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/rooms` | List all rooms with current status and latest vitals | Staff |
| `GET` | `/api/rooms/{room_id}` | Get detailed room info including patient and vitals | Staff |
| `GET` | `/api/rooms/{room_id}/vitals` | Get current vitals snapshot | Staff |
| `GET` | `/api/rooms/{room_id}/vitals/history` | Get historical vitals (query params: `start`, `end`, `interval`) | Staff |
| `GET` | `/api/rooms/{room_id}/news2` | Get current NEWS2 score and breakdown | Staff |
| `GET` | `/api/rooms/{room_id}/news2/history` | Get NEWS2 trend over time | Staff |

#### Nurse Operations

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/rooms/{room_id}/nurse-call` | Create a nurse call request | Patient |
| `GET` | `/api/nurse-calls` | List all pending nurse calls with SLA status | Staff |
| `PATCH` | `/api/nurse-calls/{call_id}` | Update nurse call status (acknowledge/complete) | Staff |
| `POST` | `/api/rooms/{room_id}/vitals/manual` | Submit manually-measured vitals (BP, consciousness) | Staff |

#### Doctor Operations

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/rounds/{ward_id}` | Get rounds list for a ward | Doctor |
| `POST` | `/api/rooms/{room_id}/notes` | Submit clinical note (text/voice transcript) | Doctor |
| `POST` | `/api/rooms/{room_id}/orders` | Submit clinical order (meds, labs, imaging) | Doctor |
| `PATCH` | `/api/orders/{order_id}/sign` | Digitally sign an order | Doctor |
| `GET` | `/api/rooms/{room_id}/timeline` | Get patient event timeline | Doctor |

#### Family Portal

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/family/auth` | Authenticate with access token → receive JWT | None |
| `GET` | `/api/family/status` | Get patient recovery status (plain language) | Family JWT |
| `GET` | `/api/family/vitals` | Get simplified vitals summary | Family JWT |
| `POST` | `/api/family/messages` | Send message to assigned nurse | Family JWT |
| `GET` | `/api/family/care-team` | Get care team info and visiting hours | Family JWT |

#### Room Controls

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/rooms/{room_id}/control/light` | Set light state (on/off/dim level) | Patient/Staff |
| `POST` | `/api/rooms/{room_id}/control/bed` | Set bed incline (up/down/stop) | Patient/Staff |

### 8.2 WebSocket Endpoints

| Endpoint | Direction | Payload | Subscribers |
|---|---|---|---|
| `ws://host/ws/vitals/{room_id}` | Server → Client | Real-time vitals stream (1/sec) | Patient Terminal, Nurse Station |
| `ws://host/ws/vitals/all` | Server → Client | All rooms vitals stream | Nurse Station |
| `ws://host/ws/alerts` | Server → Client | NEWS2 alerts, nurse call notifications | Nurse Station, Doctor App |
| `ws://host/ws/family/{token}` | Server → Client | Simplified vitals updates (1/min) | Family Portal |

#### WebSocket Vitals Payload

```json
{
    "type": "vitals_update",
    "room_id": "103",
    "bed_id": "B",
    "timestamp": "2026-09-02T14:30:00.000Z",
    "vitals": {
        "heart_rate": 132,
        "spo2": 89,
        "temperature": 39.2,
        "respiratory_rate": 28,
        "systolic_bp": 95
    },
    "news2": {
        "total_score": 8,
        "risk_level": "high",
        "parameter_scores": {
            "heart_rate": 3,
            "spo2": 3,
            "temperature": 2,
            "resp_rate": 2,
            "systolic_bp": 2,
            "consciousness": 0,
            "supplemental_o2": 0
        },
        "trend": "worsening"
    }
}
```

#### WebSocket Alert Payload

```json
{
    "type": "alert",
    "severity": "critical",
    "alert_type": "news2_high",
    "room_id": "103",
    "bed_id": "B",
    "patient_name": "Rajesh Kumar",
    "message": "NEWS2 score reached 8 (HIGH). Rapid deterioration detected.",
    "timestamp": "2026-09-02T14:30:00.000Z",
    "requires_acknowledgment": true,
    "alert_id": "alert_20260902_143000_103B"
}
```

### 8.3 MQTT Topic Hierarchy (Complete)

```
hospital/
├── cardiology/                          # Ward ID
│   ├── 101/                             # Room ID
│   │   ├── A/                           # Bed ID
│   │   │   ├── vitals                   # Published by ESP32 (QoS 1)
│   │   │   └── status                   # Online/offline (LWT)
│   │   ├── B/
│   │   │   ├── vitals
│   │   │   └── status
│   │   ├── control/
│   │   │   ├── light                    # {"state": "on"} or {"state": "off"}
│   │   │   ├── light_dim                # {"level": 75}  (0-100)
│   │   │   ├── bed_up                   # {"action": "start"} or {"action": "stop"}
│   │   │   └── bed_down                 # {"action": "start"} or {"action": "stop"}
│   │   └── nurse_call                   # {"type": "emergency", "message": "..."}
│   ├── 102/
│   │   └── ...
│   └── alerts/
│       ├── news2                        # {"room": "103", "score": 8, "risk": "high"}
│       └── system                       # {"type": "sensor_offline", "room": "101"}
├── orthopedics/
│   └── ...
└── $SYS/                               # Mosquitto system topics
    ├── broker/clients/connected
    └── broker/messages/received
```

---

## 9. Security & Compliance Considerations

### 9.1 Data Classification

| Data Category | Sensitivity | Protection Level |
|---|---|---|
| Patient Vitals (real-time) | Protected Health Information (PHI) | Encrypted in transit (TLS 1.3) |
| Clinical Notes & Orders | PHI | Encrypted at rest + in transit |
| Family Portal Data | De-identified / Simplified | Encrypted in transit |
| MQTT Sensor Data | PHI | TLS-encrypted MQTT (port 8883) |
| WebSocket Streams | PHI | WSS (WebSocket Secure) |

### 9.2 Authentication & Authorization

| Role | Auth Method | Access Scope |
|---|---|---|
| **Nurse** | Username/password + staff badge | All rooms in assigned ward |
| **Doctor** | Username/password + digital certificate | All patients + order signing |
| **Patient** | Session-based (terminal locked to room) | Own room only |
| **Family** | 6-digit access token → JWT (24hr expiry) | Simplified view of assigned patient only |

#### Family Access Token Lifecycle

```
Token Generation:
├── Generated by nurse via dashboard
├── Format: 6 alphanumeric characters (e.g., HK3M9X)
├── Bound to: specific patient_id
├── Default expiry: 7 days
├── Max active tokens per patient: 3
└── Revocable by nurse at any time

Token Usage:
├── Family enters token on portal
├── Backend validates → issues JWT (24hr session)
├── JWT contains: patient_id, permissions, issued_at, expires_at
└── Auto-logout after 24 hours (re-enter token)
```

### 9.3 HIPAA-Aligned Data Minimization

| Principle | Implementation |
|---|---|
| **Minimum Necessary** | Family portal shows only plain-language summaries, never raw clinical data |
| **Access Control** | Role-based permissions; nurses see vitals, families see summaries |
| **Audit Trail** | All data access logged with timestamp, user, and resource accessed |
| **Data Retention** | Vitals stored for 90 days, then archived. Family tokens auto-expire |
| **De-identification** | Family portal uses first name + last initial only |

### 9.4 Network Security

| Layer | Protection |
|---|---|
| WiFi | WPA2-Enterprise (802.1X) for IoT VLAN |
| MQTT | TLS 1.3 on port 8883; client certificate authentication for ESP32 devices |
| HTTP/WS | HTTPS/WSS with TLS 1.3; HSTS enabled |
| API | Rate limiting (100 req/min per IP); CORS restricted to hospital domains |
| Database | Encrypted at rest (AES-256); parameterized queries (SQLAlchemy ORM) |

---

## 10. Deployment Architecture

### 10.1 Development Environment Setup

#### Prerequisites

```
1. Python 3.10+
2. Node.js 18+ (for optional build tools)
3. Eclipse Mosquitto (MQTT broker)
4. Arduino IDE 2.x or PlatformIO (for ESP32 firmware)
5. Git
```

#### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd hospital

# 2. Set up Python virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Start Mosquitto MQTT broker
mosquitto -c mosquitto.conf

# 5. Start FastAPI backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# 6. Open dashboards in browser
# Nurse Station:  http://localhost:8000/nurse
# Doctor Rounds:  http://localhost:8000/doctor
# Family Portal:  http://localhost:8000/family
```

### 10.2 Docker Compose Architecture

```yaml
# docker-compose.yml (outline)
version: '3.8'

services:
  mosquitto:
    image: eclipse-mosquitto:2
    ports:
      - "1883:1883"
      - "8883:8883"
      - "9001:9001"
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - mosquitto
      - database
    environment:
      - MQTT_BROKER=mosquitto
      - DATABASE_URL=postgresql://user:pass@database:5432/hospital

  database:
    image: postgres:15
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=hospital
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass

volumes:
  pgdata:
```

### 10.3 Production Considerations

| Concern | Solution |
|---|---|
| **High Availability** | Deploy backend behind Nginx reverse proxy with 2+ Uvicorn workers |
| **Database Scaling** | PostgreSQL with connection pooling (PgBouncer); partition vitals table by date |
| **MQTT Scaling** | Mosquitto bridge clustering for multi-ward deployments |
| **Monitoring** | Prometheus + Grafana for system metrics; Sentry for error tracking |
| **Backup** | Automated daily PostgreSQL backups to off-site storage |
| **Updates** | Blue-green deployment for zero-downtime backend updates |

---

## 11. Bill of Materials (BOM)

### Per-Bed Hardware Cost

| Component | Model | Qty | Unit Cost (INR) | Total (INR) |
|---|---|---|---|---|
| ESP32 DevKit V1 | ESP-WROOM-32 | 1 | ₹450 | ₹450 |
| Pulse Oximeter Sensor | MAX30102 breakout | 1 | ₹200 | ₹200 |
| IR Temperature Sensor | MLX90614 (GY-906) | 1 | ₹350 | ₹350 |
| Relay Module | 4-Channel 3.3V | 1 | ₹150 | ₹150 |
| Jumper Wires | Male-to-Female, assorted | 20 | ₹3 | ₹60 |
| Breadboard | 830-point | 1 | ₹80 | ₹80 |
| USB Cable | Micro-USB / Type-C | 1 | ₹100 | ₹100 |
| Power Supply | 5V 2A USB adapter | 1 | ₹200 | ₹200 |
| **Per-Bed Total** | | | | **₹1,590** |

### Infrastructure (One-Time)

| Component | Model | Qty | Unit Cost (INR) | Total (INR) |
|---|---|---|---|---|
| WiFi Access Point | TP-Link EAP245 (PoE) | 1 | ₹5,500 | ₹5,500 |
| Server (Backend + MQTT) | Mini PC / Raspberry Pi 5 (8GB) | 1 | ₹7,000 | ₹7,000 |
| Ethernet Switch | 8-port Gigabit | 1 | ₹1,500 | ₹1,500 |
| **Infrastructure Total** | | | | **₹14,000** |

### Estimated Total for 12-Bed Ward

| Category | Cost |
|---|---|
| 12 x Per-Bed Hardware | ₹19,080 |
| Infrastructure | ₹14,000 |
| **Grand Total** | **₹33,080 (~$395 USD)** |

---

## 12. Glossary

| Term | Definition |
|---|---|
| **AVPU** | Alert, Voice, Pain, Unresponsive — consciousness assessment scale |
| **BPM** | Beats Per Minute — heart rate unit |
| **CVPU** | Confusion, Voice, Pain, Unresponsive — NEWS2 consciousness states scoring 3 |
| **ESP32** | Low-cost WiFi/BLE microcontroller by Espressif Systems |
| **I2C** | Inter-Integrated Circuit — two-wire serial communication protocol |
| **LWT** | Last Will and Testament — MQTT feature for offline detection |
| **MAX30102** | Integrated pulse oximetry and heart-rate sensor module |
| **MLX90614** | Infrared non-contact temperature sensor by Melexis |
| **MQTT** | Message Queuing Telemetry Transport — lightweight IoT messaging protocol |
| **NEWS2** | National Early Warning Score 2 — clinical deterioration scoring system |
| **PHI** | Protected Health Information — HIPAA-regulated patient data |
| **PPG** | Photoplethysmography — optical technique for blood volume measurement |
| **QoS** | Quality of Service — MQTT delivery guarantee levels (0, 1, 2) |
| **RBAC** | Role-Based Access Control — permission model by user role |
| **SpO₂** | Peripheral Oxygen Saturation — blood oxygen percentage |
| **TLS** | Transport Layer Security — encryption protocol |
| **WebSocket** | Full-duplex communication protocol over a single TCP connection |

---

> **Document Status:** This specification is a living document. Sections will be updated as the system evolves through development iterations.  
> **Next Step:** Build individual dashboards (Nurse Station → Doctor App → Family Portal) per approved plan.
