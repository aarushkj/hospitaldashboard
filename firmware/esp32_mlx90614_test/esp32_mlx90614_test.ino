/*
  ========================================================================
  AI-Powered Smart Hospital Room — Sensor Test Routine
  MLX90614 Contactless Infrared Temperature Sensor Test for ESP32 / ESP8266
  ========================================================================

  Hardware Connections (ESP32 DevKit V1):
  -------------------------------------------------------------
  MLX90614 (GY-906)   ESP32 Pin     ESP8266 (NodeMCU/D1 Mini)
  -------------------------------------------------------------
  VIN                 3.3V          3.3V (⚠️ MLX90614 is rated 3.3V)
  GND                 GND           GND
  SDA                 GPIO 21       D2 (GPIO 4)
  SCL                 GPIO 22       D1 (GPIO 5)
  -------------------------------------------------------------

  I2C Bus Notes:
  - Default I2C Address: 0x5A
  - MLX90614 communicates over SMBus (a subset of I2C). The ESP32 I2C 
    hardware clock should be configured to 50 kHz - 100 kHz (recommended 
    50000 Hz) for reliable packet acknowledgment without bus lockups.
  - Breakout boards (like GY-906) typically include built-in 4.7kΩ pull-up 
    resistors on SDA and SCL to 3.3V.

  Required Library:
  - Open Arduino IDE -> Sketch -> Include Library -> Manage Libraries...
  - Search for "Adafruit MLX90614" by Adafruit
  - Install the library (and allow installing Adafruit BusIO if prompted)
  ========================================================================
*/

#include <Wire.h>
#include <Adafruit_MLX90614.h>

// Pin definitions
#if defined(ESP32)
  #define I2C_SDA 21
  #define I2C_SCL 22
  #define BOARD_NAME "ESP32 DevKit"
#elif defined(ESP8266)
  #define I2C_SDA D2 // GPIO 4
  #define I2C_SCL D1 // GPIO 5
  #define BOARD_NAME "ESP8266 NodeMCU"
#else
  #define BOARD_NAME "Generic Arduino"
#endif

// Sensor object
Adafruit_MLX90614 mlx = Adafruit_MLX90614();

// Timing variables
unsigned long lastSampleTime = 0;
const unsigned long SAMPLE_INTERVAL_MS = 1000; // Read every 1 second

// Function to scan I2C bus and confirm 0x5A presence
bool scanI2CAddress(uint8_t targetAddress) {
  byte error;
  Wire.beginTransmission(targetAddress);
  error = Wire.endTransmission();
  return (error == 0);
}

// Function to evaluate clinical temperature status
const char* getTemperatureStatus(float objTempC) {
  if (objTempC < 32.0) {
    return "No Target / Room Object";
  } else if (objTempC < 35.5) {
    return "⚠️ Hypothermia / Low Reading";
  } else if (objTempC >= 35.5 && objTempC <= 37.5) {
    return "✅ Normal Body Temp";
  } else if (objTempC > 37.5 && objTempC <= 38.3) {
    return "🟡 Low-Grade Fever";
  } else {
    return "🔴 High Fever Alert!";
  }
}

void setup() {
  Serial.begin(115200);
  delay(1500); // Allow serial monitor to open

  Serial.println();
  Serial.println("==================================================");
  Serial.println("   AI Smart Hospital Room — MLX90614 Sensor Test  ");
  Serial.printf("   Target Architecture: %s\n", BOARD_NAME);
  Serial.println("==================================================");

  // Initialize I2C Bus with explicit pins
  #if defined(ESP32) || defined(ESP8266)
  Serial.printf("[I2C] Initializing bus on SDA=GPIO%d, SCL=GPIO%d...\n", I2C_SDA, I2C_SCL);
  Wire.begin(I2C_SDA, I2C_SCL);
  #else
  Wire.begin();
  #endif

  // MLX90614 prefers 50 kHz - 100 kHz SMBus clock speed
  Wire.setClock(50000); 
  Serial.println("[I2C] Clock speed set to 50 kHz (SMBus optimized).");

  // Step 1: Probe I2C Bus for Address 0x5A
  Serial.print("[I2C] Checking for MLX90614 at address 0x5A... ");
  if (scanI2CAddress(0x5A)) {
    Serial.println("FOUND! ✅");
  } else {
    Serial.println("NOT FOUND! ❌");
    Serial.println("\n[Diagnostic Checklist]");
    Serial.println("1. Verify VIN is connected to 3.3V and GND to common GND.");
    Serial.println("2. Verify SDA -> GPIO 21, SCL -> GPIO 22 on ESP32.");
    Serial.println("3. Ensure wires are firmly seated in breadboard/header.");
    Serial.println("4. Run an I2C scanner to check if address was reconfigured.");
    Serial.println("Halting test routine until resolved...");
    while (1) {
      delay(1000);
    }
  }

  // Step 2: Initialize Adafruit MLX90614 library
  if (!mlx.begin()) {
    Serial.println("❌ ERROR: Could not connect to MLX90614 via Adafruit driver!");
    Serial.println("Check pull-up resistors or try power-cycling the sensor.");
    while (1) {
      delay(1000);
    }
  }

  Serial.println("✅ MLX90614 initialized successfully!");
  Serial.println("\n[Measurement Protocol]");
  Serial.println("- Optimal target distance: 2 cm to 5 cm from sensor front face.");
  Serial.println("- Field of View: 90° cone (ensure no hot objects in background).");
  Serial.println("--------------------------------------------------");
  Serial.println("Ambient (°C) | Object (°C) | Object (°F) | Clinical Assessment");
  Serial.println("--------------------------------------------------");
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - lastSampleTime >= SAMPLE_INTERVAL_MS) {
    lastSampleTime = currentMillis;

    // Set SMBus safe clock speed prior to transaction
    Wire.setClock(50000);

    // Read Temperatures
    float ambientC = mlx.readAmbientTempC();
    float objectC  = mlx.readObjectTempC();
    float objectF  = mlx.readObjectTempF();

    // Verify readings are valid numbers
    if (isnan(ambientC) || isnan(objectC)) {
      Serial.println("⚠️ ERROR: Failed to read from MLX90614! Check wiring.");
      return;
    }

    // Determine clinical status
    const char* status = getTemperatureStatus(objectC);

    // Print formatted table row
    Serial.printf(" %6.2f °C   |  %6.2f °C  |  %6.2f °F  | %s\n",
                  ambientC, objectC, objectF, status);
  }
}
