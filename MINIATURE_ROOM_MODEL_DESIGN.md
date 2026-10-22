# 🏥 AI-Powered Smart Hospital Room — Miniature Prototype Design Guide
> **Physical Scale Model & IoT Demonstration Diorama Specification**  
> **Recommended Scale:** 1:10 Architectural Prototype Scale  
> **Dimensions:** 450 mm (W) × 320 mm (D) × 300 mm (H)

---

## 1. Design Overview & Purpose

The **Miniature Smart Hospital Room Diorama** is a scaled physical prototype designed to exhibit and validate the full IoT architecture of the **AI-Powered Smart Hospital Room**. It bridges hardware sensors, mechanical actuators, embedded firmware (ESP32), and live web dashboards into an interactive tabletop demonstration unit.

### Core Demonstration Features Built into the Model:
1. **Live Biometric Telemetry Station:** Working MAX30102 pulse oximeter finger dock and MLX90614 infrared temperature sensor mounted on an articulated boom.
2. **Motorized Adjustable Hospital Bed:** Articulated headrest controlled via the 4-channel relay (Bed Up / Bed Down) using an SG90 micro-servo or mini geared actuator.
3. **Bedside Interactive Terminal:** Landscape mount fitted for an existing smartphone (5.5"–6.5") or 5" LCD screen running the live `patient.html` dashboard.
4. **Nurse Call Station & Over-Door Dome Light:** Tactile bedside emergency call button paired with a dual-color LED dome lamp (Green: Normal, Pulsing Amber: Nurse Requested, Flashing Red: Critical NEWS2 Alert).
5. **Room Automation Lighting:** 5V LED strip under the ceiling soffit driven by Relay CH1 & CH2 (dimmable).
6. **Sub-Floor "Electronics Bay":** Integrated false basement floor with a clear acrylic viewing window displaying the ESP32 DevKit, 4-channel relay module, breadboard/perfboard, and neat wire harnesses.

---

## 2. Scale & Dimensional Specifications (1:10 Scale)

In 1:10 scale, **1 cm on the model = 10 cm in real life** (100 mm = 1 meter). This scale provides the ideal balance between desktop portability and sufficient space to mount standard electronics without micro-soldering.

### Overall Outer Dimensions:
- **Width (Frontage):** 450 mm (45 cm / 17.7 in)
- **Depth:** 320 mm (32 cm / 12.6 in)
- **Total Height:** 300 mm (30 cm / 11.8 in)
  - **Upper Hospital Room Stage:** 240 mm (24 cm) interior ceiling clearance
  - **Lower Electronics Basement:** 60 mm (6 cm) hidden compartment

```
+-------------------------------------------------------------+  ▲
|  [Ceiling Beam / 5V LED Valance]                            |  │
|                                                             |  │
|   +---------+        +--------------------------+           |  │
|   | Nurse   |        |  MLX90614 IR Boom Arm    |           |  │
|   | Call    |        +------------\             |           |  240 mm
|   | Dome    |                      \            |           |  (Room
|   | Light   |                       ▼           |           |   Stage)
|   +---------+     [Bedside Phone] [Patient]     |           |  │
|                   [Terminal 5.5"] [Headrest]    |           |  │
|   [Bedside Table]   |        |    /             |           |  │
|   [Water/Meds   ]   +--------+---/ [Bed Frame]  |           |  │
|                      (MAX30102 Cradle)          |           |  │
+=============================================================+  ▼
|  SUB-FLOOR ELECTRONICS BAY (Clear Acrylic Window / Drawer)  |  ▲ 60 mm
|  [ESP32 DevKit]    [4-Ch Relay]    [Terminal Bus / 5V USB]  |  ▼ (Electronics)
+-------------------------------------------------------------+
◄────────────────────────── 450 mm ──────────────────────────►
```

---

## 3. Floor Plan & Spatial Layout

```
                 ◄────────────────── 450 mm ──────────────────►
         ▲       +────────────────────────────────────────────+
         │       │ [REAR FALSE WALL / 25mm CABLE SERVICE DUCT]│
         │       +--------------------------------------------+
         │       │                                            │
         │       │   ┌────────┐   ┌───────────────────────┐   │
         │       │   │Night-  │   │     HOSPITAL BED      │   │
         │       │   │stand   │   │  (210 mm x 105 mm)    │   │
                 │   │        │   │                       │   │
       320 mm    │   │[Water] │   │  [Articulated Head]   │   │
                 │   └────────┘   │           ▲           │   │
         │       │        │       │    (Servo Underneath) │   │
         │       │        ▼       │                       │   │
         │       │   [Phone Mount]│  [MAX30102 Cradle]   │   │
         │       │   (Bedside     │  (Right arm rest)     │   │
         │       │    Terminal)   │                       │   │
         │       │                └───────────────────────┘   │
         │       │ [Nurse Button]                             │
         │       │ [Dome LED]            (Visitor / Doctor    │
         │       │                           Walkway)         │
         │       │ [Room Doorway]                             │
         ▼       +────────────────────────────────────────────+
                 ◄── Open Front Face for Viewing & Hands-on ──►
```

---

## 4. Subsystems & Integration Engineering

### 4.1 Sub-Floor Electronics Bay (The "Basement")
- **Structure:** 60 mm high hollow plinth located beneath the room's floorboard.
- **Access:** The front panel has a clear 2 mm transparent acrylic window (or slide-out drawer) so observers can see the live microcontroller, flashing LEDs, and switching relays.
- **Cable Penetrations:** Three 12 mm grommet pass-through holes drilled into the floorboard:
  1. *Hole A (Bed Base):* 4-wire servo signal/power for bed incline + 4-wire I2C MAX30102 ribbon.
  2. *Hole B (Rear Wall Cavity):* 4-wire I2C MLX90614 + 2-wire LED strip ceiling power.
  3. *Hole C (Bedside Table / Headwall):* 3-wire Nurse Call tactile button + 3-wire bicolor Dome LED.
- **Power Distribution:** Single micro-USB or USB-C breakout supplying 5V 2.5A to an internal screw-terminal distribution block (supplies ESP32 5V pin, Relay VCC, Servo 5V, and LED strip).

---

### 4.2 Motorized Hospital Bed Incline Mechanism
To demonstrate **Relay Channel 3 (Bed Up)** and **Relay Channel 4 (Bed Down)**:
- **Bed Dimensions:** 210 mm length × 105 mm width × 65 mm mattress height.
- **Materials:** 3D printed PLA or 3mm balsa/acrylic sheets. The bed is split into a fixed lower body section (120 mm) and a hinged upper backrest (90 mm) connected with a miniature brass hinge.
- **Actuation Method (Dual Options):**
  - **Option 1 (Micro-Servo SG90 - Recommended):** Underneath the bed, an SG90 9g servo arm is fitted with a smooth cam roller that pushes against the underside of the headrest.
    - When Relay CH3 triggers (or a direct ESP32 GPIO pulse), the servo sweeps to 45°–60° incline.
    - When Relay CH4 triggers, it sweeps back down to 0° (flat).
  - **Option 2 (Micro 5V Geared Worm Motor / Leadscrew):** Miniature linear screw actuator pushing a scissor lift linkage.

```
       Hinged Headrest (90 mm)
          /
         /  <-- Pushed upwards by cam
        /
       o----------------------------- Fixed Lower Bed Frame (120 mm)
      / ▲
     /  │ (SG90 Micro-Servo Arm / Cam)
    ===┴============================= Room Floor Surface
```

---

### 4.3 Biometric Sensor Cradles

#### A. MAX30102 Pulse Oximeter & Heart Rate Cradle:
- **Placement:** Integrated into the right-hand bedside armrail or bedside sensor pad.
- **Mounting Design:** A silicone/foam ergonomic finger rest groove. The MAX30102 sensor PCB is mounted flush with the surface, LED aperture facing upward through a clean window.
- **Testing Ergonomics:** When a demonstrator or user places their index finger on the bed's sensor groove, the red/IR LEDs pulse and live vitals instantly stream to the ESP32 and dashboard!

#### B. MLX90614 Non-Contact Infrared Temperature Sensor:
- **Placement:** Mounted on an adjustable overhead gooseneck or articulated miniature surgical light boom anchored to the rear headwall.
- **Focal Distance:** Targeted at 2.5 cm to 4.0 cm above the patient headrest/forehead area.
- **Visual Accent:** A miniature white 3D-printed conical shroud mimics modern medical IR thermal scanners.

---

### 4.4 Bedside Patient Terminal Mount
- **Display Options:**
  - **Smartphone Mount (Zero extra cost):** A custom backplate slot that slides in an existing iPhone or Android device horizontally. The phone connects to WiFi and opens `http://<ESP32-IP>:8000/patient` or local web server.
  - **3.5"–5.0" HDMI / SPI Touchscreen:** Cleanly encased in a white plastic monitor housing on an articulating arm.
- **User Actions Supported:** The user can touch the screen to trigger the Nurse Call, toggle room lighting, or adjust bed incline directly from the miniature room!

---

### 4.5 Nurse Call Station & Dome Light
- **Call Button:** Bedside miniature 6x6 mm tactile push-button with a red 3D-printed or silicone cap marked "NURSE".
- **Corridor / Over-Door Dome Light:**
  - A small 5 mm dual-color Red/Green common-cathode LED or single WS2812B addressable mini-pixel mounted inside a frosted dome lens above the room entrance.
  - **Normal Operation:** Steady faint green glow.
  - **Call Active:** Pulsing amber/orange until acknowledged on the Nurse Command Station.
  - **NEWS2 Escalation Alert (Score ≥ 7):** Rapid flashing strobe red with audible beep.

---

### 4.6 Room Ambient & Examination Lighting
- **Ceiling Valance:** A recessed light cove built along the front ceiling beam.
- **Light Source:** A 25 cm strip of 5V COB warm-white LED tape (5000K daylight or 4000K natural white).
- **Control:** Routed through Relay CH1 (Main Light ON/OFF) with optional PWM switching for dimming.

---

## 5. Bill of Materials for Model Construction

### Structural & Architectural Materials:
| Material | Description | Quantity | Est. Cost (INR) |
|---|---|---|---|
| **5 mm Foam Board (Sunboard)** | Rigid white PVC foam sheet for walls & floor | 2 sheets (60×90 cm) | ₹350 |
| **2 mm Clear Acrylic Sheet** | Transparent window for electronics bay & door glass | 1 piece (45×15 cm) | ₹120 |
| **Wood Grain / Vinyl Floor Tile Sticker** | Hospital vinyl floor texture (grey or light oak) | 1 sheet | ₹80 |
| **Miniature Brass Hinges (10 mm)** | For articulated hospital bed headrest | 2 pcs | ₹40 |
| **1:10 Medical Patient Figure** | 17–18 cm posable medical dummy / action figure | 1 pc | ₹300 |
| **Hardware Fasteners / Standoffs** | M3 nylon standoffs and screws for PCB mounting | 1 kit | ₹100 |
| **Adhesives** | UHU Por / Acrylic cement / Hot melt glue sticks | — | ₹90 |

### Electronics & IoT Hardware (Per Room):
| Component | Function in Model | Qty | Est. Cost (INR) |
|---|---|---|---|
| **ESP32 DevKit V1** | Central Microcontroller / MQTT Publisher | 1 | ₹450 |
| **MAX30102 Module** | Heart Rate & SpO2 Finger Sensor | 1 | ₹200 |
| **MLX90614 (GY-906)** | Contactless Infrared Body Temperature | 1 | ₹350 |
| **4-Channel 5V/3.3V Relay** | Controls Bed Motor, Room Lights, Dimmer | 1 | ₹150 |
| **SG90 Micro-Servo 9g** | Drives bed headrest incline mechanism | 1 | ₹120 |
| **5V COB LED Strip (White)** | Ceiling room lighting | 30 cm | ₹80 |
| **5 mm Bicolor LED / Dome** | Nurse Call corridor status indicator | 1 | ₹15 |
| **Tactile Push Button (Red)** | Bedside nurse call emergency trigger | 1 | ₹10 |
| **Small Smartphone or 5" LCD** | Live Bedside Patient Terminal display | 1 | Existing / ₹0 |
| **5V 2.5A USB Adapter & Wire** | Main DC power source & ribbon wires | 1 | ₹220 |
| **Total Estimated Build Cost** | | | **₹2,675 (~$32 USD)** |

---

## 6. Fabrication Cut Sheet & Assembly Steps

### Step 1: Cutting Panels (5 mm Sunboard / Acrylic)
1. **Base Foundation (Bottom):** 450 mm × 320 mm (1 pc)
2. **Intermediate Room Floor:** 450 mm × 295 mm (1 pc) *(Leaves 25 mm gap at rear for cable riser)*
3. **Rear Headwall:** 450 mm × 300 mm (1 pc)
4. **Left Partition Wall:** 320 mm × 300 mm (1 pc)
5. **Right Partition Wall (Cutaway profile):** 320 mm wide, angled down from 300 mm to 100 mm for open viewing
6. **Ceiling Header Valance:** 450 mm × 40 mm (1 pc)
7. **Electronics Bay Front Clear Faceplate:** 450 mm × 60 mm clear acrylic (1 pc)

### Step 2: Wall & Floor Assembly
1. Glue the Left Wall and Rear Wall perpendicular to the Base Foundation at 90° using right-angle jigs and acrylic/cyanoacrylate adhesive.
2. Insert 4 vertical support corner pillars (60 mm height) inside the base to support the Intermediate Room Floor.
3. Drill the three 12 mm wire grommet holes in the Room Floor.
4. Adhere medical-style matte grey or light wood self-adhesive vinyl wrap to the top surface of the Room Floor.
5. Secure the Room Floor on top of the 60 mm pillars.

### Step 3: Electronics Bay Installation
1. Mount the ESP32 DevKit V1 and 4-Channel Relay module onto the base board using M3 nylon standoffs.
2. Place a mini 400-point breadboard or terminal strip between them.
3. Wire the 5V and GND power rails from the rear USB power connector to the ESP32 and Relay VCC.
4. Fasten the clear front acrylic faceplate with corner screws or magnetic latches for quick maintenance access.

### Step 4: Installing Sensors & Bed Mechanism
1. Assemble the 1:10 bed frame; mount the micro-servo underneath the hinged backrest.
2. Route the 3-wire servo cable and 4-wire MAX30102 ribbon cable down through the bed floor grommet into the basement.
3. Mount the MLX90614 sensor on the wall boom; feed its wires behind the rear false wall.
4. Connect all I2C lines (SDA to GPIO 21, SCL to GPIO 22) into the shared terminal bus.

---

## 7. Electrical Schematics & Pin Mapping

```
ESP32 DevKit V1 Pin Assignments:
┌──────────────────┬────────────────────────────────────────────────────────┐
│ ESP32 Pin        │ Connected Component                                    │
├──────────────────┼────────────────────────────────────────────────────────┤
│ 3.3V             │ MAX30102 VIN, MLX90614 VIN                             │
│ 5V (VIN)         │ 4-Ch Relay VCC, SG90 Servo VCC, 5V LED Strip Power   │
│ GND              │ Common Ground (Sensors, Relays, Servo, LEDs)           │
│ GPIO 21 (SDA)    │ Shared I2C SDA (MAX30102 + MLX90614)                  │
│ GPIO 22 (SCL)    │ Shared I2C SCL (MAX30102 + MLX90614)                  │
│ GPIO 19          │ MAX30102 INT (Optional Data Ready Interrupt)           │
│ GPIO 25          │ Relay CH1 (Ceiling Room Light ON/OFF)                 │
│ GPIO 26          │ Relay CH2 (Ceiling Dimmer / Auxiliary Lamp)           │
│ GPIO 27          │ Relay CH3 / Servo Pulse (Bed Incline UP)              │
│ GPIO 14          │ Relay CH4 / Servo Pulse (Bed Incline DOWN)            │
│ GPIO 32          │ Nurse Call Tactile Button (INPUT_PULLUP)              │
│ GPIO 33          │ Nurse Call Dome Lamp Red LED                           │
│ GPIO 4           │ Nurse Call Dome Lamp Green LED                         │
└──────────────────┴────────────────────────────────────────────────────────┘
```

---

## 8. Interactive Demonstration Script for Presenters

When showing this miniature room to professors, project evaluators, or hospital executives:

1. **Step 1 — Ambient Idle State:**
   - Power on the 5V supply. Show the room ceiling LED lighting illuminate softly.
   - Point to the clear sub-floor electronics bay: highlight the ESP32 connected to local WiFi and MQTT broker.
   - The bedside smartphone terminal displays live room stats with green "Normal" indicators.

2. **Step 2 — Real-Time Biometric Reading:**
   - Place your finger onto the bedside MAX30102 finger groove.
   - Within 3–4 seconds, point to the bedside terminal and the external Nurse Station dashboard on your laptop: real-time Heart Rate (e.g. 74 BPM) and SpO2 (98%) update live every second!
   - Point out the overhead MLX90614 infrared beam measuring continuous skin temperature without physical touch.

3. **Step 3 — Patient Comfort Automation:**
   - On the bedside phone screen, tap the **"Bed Incline UP"** button.
   - Watch Relay CH3 click in the lower bay as the miniature hospital bed's headrest smoothly rises to 45° so the patient can sit upright!
   - Tap the **"Room Lights"** button to toggle the ceiling LEDs.

4. **Step 4 — Emergency & NEWS2 Escalation:**
   - Press the bedside **NURSE CALL** button.
   - Instantly, the corridor dome light begins flashing amber, and an audible chime rings on the Nurse Command Station with an SLA response countdown timer.
   - Simulate an adverse vital event (or enter SpO2 < 90% in test mode): the dome light flashes red, indicating an automated NEWS2 High Risk alert!
