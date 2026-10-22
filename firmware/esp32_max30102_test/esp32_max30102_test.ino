/*
  ========================================================================
  AI-Powered Smart Hospital Room — Sensor Test Routine
  MAX30102 Pulse Oximeter & Heart Rate Sensor Test for ESP32 / ESP8266
  ========================================================================

  Hardware Connections (ESP32 DevKit V1):
  -------------------------------------------------------------
  MAX30102 Pin     ESP32 Pin     ESP8266 (NodeMCU/D1 Mini)
  -------------------------------------------------------------
  VIN              3.3V          3.3V
  GND              GND           GND
  SDA              GPIO 21       D2 (GPIO 4)
  SCL              GPIO 22       D1 (GPIO 5)
  INT              NC / GPIO 19  NC
  -------------------------------------------------------------

  Required Library:
  - Open Arduino IDE -> Sketch -> Include Library -> Manage Libraries...
  - Search for "SparkFun MAX3010x" by SparkFun Electronics
  - Install the library (and any prompted dependencies)
*/

#include <Wire.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"

MAX30105 particleSensor;

#define BUFFER_SIZE 100 // 100 samples = ~4 seconds of data at 25 SPS
#define FINGER_PRESENCE_THRESHOLD 50000 // IR value below this implies no finger detected

uint32_t irBuffer[BUFFER_SIZE];  // Infrared LED sensor data
uint32_t redBuffer[BUFFER_SIZE]; // Red LED sensor data

int32_t bufferLength = BUFFER_SIZE;
int32_t spo2 = 0;              // Calculated SpO2 value (%)
int8_t  validSPO2 = 0;         // 1 if SpO2 calculation is valid
int32_t heartRate = 0;         // Calculated Heart Rate (BPM)
int8_t  validHeartRate = 0;    // 1 if Heart Rate calculation is valid

// Pin definition for ESP32 I2C (default Wire pins)
#if defined(ESP32)
  #define I2C_SDA 21
  #define I2C_SCL 22
#elif defined(ESP8266)
  #define I2C_SDA D2
  #define I2C_SCL D1
#endif

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- [ESP32] MAX30102 SpO2 & Heart Rate Test ---");

  // Initialize I2C Bus
  #if defined(ESP32) || defined(ESP8266)
  Wire.begin(I2C_SDA, I2C_SCL);
  #else
  Wire.begin();
  #endif

  // Initialize MAX30102 sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) { // Fast mode: 400kHz
    Serial.println("❌ ERROR: MAX30102 sensor not found!");
    Serial.println("  1. Check SDA/SCL wiring (ESP32: SDA->21, SCL->22).");
    Serial.println("  2. Ensure power is supplied to 3.3V (NOT 5V unless board has regulator).");
    Serial.println("  3. Verify I2C address is 0x57 using an I2C scanner.");
    while (1) {
      delay(1000);
    }
  }

  Serial.println("✅ MAX30102 detected successfully!");
  Serial.println("Configuring sensor parameters...");

  // Sensor configuration parameters:
  byte ledBrightness = 60;   // Options: 0=Off to 255=50mA (60 = ~12mA)
  byte sampleAverage = 4;    // Options: 1, 2, 4, 8, 16, 32
  byte ledMode = 2;          // 2 = Red + IR (SpO2 mode)
  byte sampleRate = 100;     // Options: 50, 100, 200, 400, 800, 1000, 1600, 3200
  int pulseWidth = 411;      // Options: 69, 118, 215, 411 (411us = 18-bit resolution)
  int adcRange = 4096;       // Options: 2048, 4096, 8192, 16384

  particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);

  Serial.println("Place your index finger lightly on the sensor to begin sampling...");
}

void loop() {
  // 1. Gather initial batch of 100 samples
  Serial.println("\n[Sampling] Collecting initial 100 raw samples (approx. 4 seconds)...");
  for (byte i = 0; i < bufferLength; i++) {
    while (particleSensor.available() == false) {
      particleSensor.check(); // Poll sensor for new FIFO data
    }
    redBuffer[i] = particleSensor.getRed();
    irBuffer[i]  = particleSensor.getIR();
    particleSensor.nextSample(); // Advance to next FIFO reading
  }

  // 2. Initial calculation using Maxim's PPG algorithm
  maxim_heart_rate_and_oxygen_saturation(
    irBuffer, bufferLength, redBuffer,
    &spo2, &validSPO2, &heartRate, &validHeartRate
  );

  // 3. Continuous rolling loop (updates every 25 samples = ~1 sec)
  while (true) {
    // Shift the buffer: discard first 25 samples, slide remaining 75 forward
    for (byte i = 25; i < 100; i++) {
      redBuffer[i - 25] = redBuffer[i];
      irBuffer[i - 25]  = irBuffer[i];
    }

    // Collect next 25 samples
    for (byte i = 75; i < 100; i++) {
      while (particleSensor.available() == false) {
        particleSensor.check();
      }
      redBuffer[i] = particleSensor.getRed();
      irBuffer[i]  = particleSensor.getIR();
      particleSensor.nextSample();
    }

    // Check if finger is placed based on average IR signal level
    uint32_t latestIR = irBuffer[99];
    if (latestIR < FINGER_PRESENCE_THRESHOLD) {
      Serial.print("⚠️  No finger detected! (IR Reading: ");
      Serial.print(latestIR);
      Serial.println(") - Please place finger gently on sensor.");
      delay(500);
      continue;
    }

    // Compute SpO2 and Heart Rate
    maxim_heart_rate_and_oxygen_saturation(
      irBuffer, bufferLength, redBuffer,
      &spo2, &validSPO2, &heartRate, &validHeartRate
    );

    // Print readable diagnostic output
    Serial.println("----------------------------------------------");
    Serial.print("IR: ");
    Serial.print(latestIR);
    Serial.print(" | RED: ");
    Serial.print(redBuffer[99]);

    if (validHeartRate == 1 && heartRate >= 40 && heartRate <= 180) {
      Serial.print(" | HR: ");
      Serial.print(heartRate);
      Serial.print(" BPM");
    } else {
      Serial.print(" | HR: Calibrating...");
    }

    if (validSPO2 == 1 && spo2 >= 70 && spo2 <= 100) {
      Serial.print(" | SpO2: ");
      Serial.print(spo2);
      Serial.println("%");
    } else {
      Serial.println(" | SpO2: Calibrating...");
    }
  }
}
