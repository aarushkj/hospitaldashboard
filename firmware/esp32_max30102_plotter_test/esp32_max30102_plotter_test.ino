/*
  ========================================================================
  AI-Powered Smart Hospital Room — Sensor Prototype Test Routine
  MAX30102 / MAX30100 Real-Time PPG Waveform & Heartbeat Serial Plotter
  ========================================================================

  Hardware Connections (ESP32 DevKit V1):
  -------------------------------------------------------------
  MAX30102 Pin     ESP32 Pin     ESP8266 (NodeMCU/D1 Mini)
  -------------------------------------------------------------
  VIN              3.3V          3.3V (⚠️ Check 3V3 jumper on board)
  GND              GND           GND
  SDA              GPIO 21       D2 (GPIO 4)
  SCL              GPIO 22       D1 (GPIO 5)
  INT              NC            NC
  -------------------------------------------------------------

  HOW TO VIEW THE LIVE GRAPH:
  -------------------------------------------------------------
  1. Upload this sketch to your ESP32.
  2. In Arduino IDE, open: Tools -> Serial Plotter (or press Ctrl + Shift + L).
  3. Ensure baud rate in the bottom-right corner is set to: 115200.
  4. Place your index finger lightly on the MAX30102 sensor.
  5. You will see 3 synchronized live visual tracks:
     - Track 1 (PPG_Wave): Clean AC-filtered cardiac pulsatile waveform
     - Track 2 (Beat_Trigger): Vertical spike on each detected heartbeat
     - Track 3 (Avg_BPM): Real-time calculated heart rate (BPM)
  ========================================================================
*/

#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h" // SparkFun beat detection algorithm

MAX30105 particleSensor;

// Pin definitions
#if defined(ESP32)
  #define I2C_SDA 21
  #define I2C_SCL 22
#elif defined(ESP8266)
  #define I2C_SDA D2
  #define I2C_SCL D1
#endif

// Finger detection threshold (IR below 50,000 means no finger present)
const int32_t FINGER_THRESHOLD = 50000;

// DC baseline removal filter variables (for clean AC PPG waveform centering around 0)
float dcIR = 0;
float dcRed = 0;
const float DC_ALPHA = 0.95; // Smoothing factor for DC component

// Beat detection & Heart Rate calculation
const byte RATE_SIZE = 4; // Average of 4 heartbeats
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0; // Time at which the last beat occurred

float beatsPerMinute = 0;
int beatAvg = 0;
int beatPulseMarker = 0; // Spike indicator for plotter (0 or 400)

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize I2C Bus at 400kHz (Fast Mode for smooth waveform plotting)
  #if defined(ESP32) || defined(ESP8266)
  Wire.begin(I2C_SDA, I2C_SCL);
  #else
  Wire.begin();
  #endif
  Wire.setClock(400000);

  // Initialize MAX30102 / MAX30105 sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("PPG_Wave:0,Beat_Trigger:0,Avg_BPM:0");
    // Print diagnostic message on serial
    Serial.println("❌ Error: MAX30102 sensor not found on I2C address 0x57!");
    Serial.println("Check: SDA->GPIO 21, SCL->GPIO 22, VIN->3.3V, GND->GND.");
    while (1) {
      delay(1000);
    }
  }

  // Sensor Configuration optimized for real-time PPG waveform plotting:
  // - ledBrightness: 0x1F (approx. 6.4mA) to prevent photodetector saturation
  // - sampleAverage: 4 samples averaged per FIFO output
  // - ledMode: 2 (Red + IR mode)
  // - sampleRate: 400 samples/sec for high fidelity waveform contours
  // - pulseWidth: 411us (18-bit ADC resolution)
  // - adcRange: 4096 (high optical sensitivity)
  byte ledBrightness = 60; // 0=Off to 255=50mA (60 = ~12mA)
  byte sampleAverage = 4;  // 1, 2, 4, 8, 16, 32
  byte ledMode = 2;         // 2 = Red + IR
  int sampleRate = 400;     // 50, 100, 200, 400, 800, 1000
  int pulseWidth = 411;     // 69, 118, 215, 411 (411us = 18-bit)
  int adcRange = 4096;      // 2048, 4096, 8192, 16384

  particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
  particleSensor.setPulseAmplitudeRed(0x1F); // Turn Red LED to low-medium
  particleSensor.setPulseAmplitudeGreen(0);  // Turn off Green LED

  // Print initial graph header for Arduino IDE 2.x Plotter legend
  Serial.println("PPG_Wave:0,Beat_Trigger:0,Avg_BPM:0");
}

void loop() {
  // Read current sample from FIFO
  long irValue = particleSensor.getIR();
  long redValue = particleSensor.getRed();

  // Reset beat pulse indicator from previous cycle
  beatPulseMarker = 0;

  // Case 1: No finger detected on sensor
  if (irValue < FINGER_THRESHOLD) {
    dcIR = 0;
    beatsPerMinute = 0;
    beatAvg = 0;

    // Send zeroed baseline so graph flattens smoothly
    Serial.print("PPG_Wave:0,");
    Serial.print("Beat_Trigger:0,");
    Serial.println("Avg_BPM:0");
    delay(20);
    return;
  }

  // Case 2: Finger Present -> Process PPG Waveform
  // High-Pass / DC Baseline Removal Filter:
  // y[n] = x[n] - DC[n]
  // DC[n] = DC[n-1] * alpha + x[n] * (1 - alpha)
  if (dcIR == 0) {
    dcIR = irValue; // Initialize on first finger touch
  } else {
    dcIR = (dcIR * DC_ALPHA) + (irValue * (1.0 - DC_ALPHA));
  }
  float ppgWave = irValue - dcIR; // Invert or center around 0

  // Heartbeat Peak Detection (using SparkFun algorithm)
  if (checkForBeat(irValue) == true) {
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60.0 / (delta / 1000.0);

    // Filter reasonable biological human heart rates (35 to 220 BPM)
    if (beatsPerMinute >= 35 && beatsPerMinute <= 220) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;

      // Compute rolling average
      int total = 0;
      for (byte x = 0; x < RATE_SIZE; x++) {
        total += rates[x];
      }
      beatAvg = total / RATE_SIZE;

      // Draw a vertical spike marker on the graph at the moment of heartbeat
      beatPulseMarker = 350; 
    }
  }

  // ====================================================================
  // ARDUINO SERIAL PLOTTER OUTPUT
  // Format: "Key1:Value1,Key2:Value2,Key3:Value3"
  // ====================================================================
  Serial.print("PPG_Wave:");
  Serial.print(ppgWave, 1);
  Serial.print(",");

  Serial.print("Beat_Trigger:");
  Serial.print(beatPulseMarker);
  Serial.print(",");

  Serial.print("Avg_BPM:");
  Serial.println(beatAvg);

  // Small delay to match sample rate and keep Serial transmission stable
  delay(15);
}
