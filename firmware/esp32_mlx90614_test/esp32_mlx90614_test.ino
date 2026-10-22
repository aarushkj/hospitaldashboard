/*
  ========================================================================
  AI-Powered Smart Hospital Room — MLX90614 Sensor Diagnostic & Test
  Target: ESP32 DevKit V1 (Pure ASCII - No Serial Glitches)
  ========================================================================
  
  WIRING CHECKLIST:
  -------------------------------------------------------------
  MLX90614 (GY-906)   ESP32 DevKit Pin
  -------------------------------------------------------------
  VIN                 VIN / 5V (or 3.3V if your sensor is 3V)
  GND                 GND (Common Ground)
  SCL                 GPIO 22 (Pin 2 from top-right corner)
  SDA                 GPIO 21 (Pin 5 from top-right corner)
  -------------------------------------------------------------
  CRITICAL: On ESP32 DevKit V1:
  - Pin 2 is D22 (SCL)
  - Pin 3 is TX0 (DO NOT USE)
  - Pin 4 is RX0 (DO NOT USE)
  - Pin 5 is D21 (SDA)
  * There must be TWO EMPTY PINS between your SCL and SDA jumpers!
  ========================================================================
*/

#include <Wire.h>
#include <Adafruit_MLX90614.h>

#define I2C_SDA 21
#define I2C_SCL 22

Adafruit_MLX90614 mlx = Adafruit_MLX90614();

bool mlxReady = false;
unsigned long lastScanTime = 0;
const unsigned long SCAN_INTERVAL = 1500; // Scan every 1.5s until found

void scanBus() {
  const uint32_t testSpeeds[] = {10000, 25000, 50000, 100000};
  byte count = 0;

  for (int s = 0; s < 4; s++) {
    uint32_t speed = testSpeeds[s];
    Wire.setClock(speed);

    for (byte addr = 1; addr < 127; addr++) {
      Wire.beginTransmission(addr);
      byte error = Wire.endTransmission();

      if (error == 0) {
        Serial.print("  >>> Device FOUND at address: 0x");
        if (addr < 16) Serial.print("0");
        Serial.print(addr, HEX);
        Serial.print(" (at ");
        Serial.print(speed / 1000);
        Serial.print(" kHz)");

        if (addr == 0x5A) {
          Serial.println(" <-- MLX90614 MATCH! [SUCCESS]");
          count++;
          if (mlx.begin()) {
            Serial.println("[SUCCESS] MLX90614 driver connected! Streaming readings...\n");
            mlxReady = true;
            Serial.println("--------------------------------------------------");
            Serial.println("Ambient (C)  |  Object (C)   |  Object (F)   | Status");
            Serial.println("--------------------------------------------------");
            return;
          } else {
            Serial.println("[WARN] Sensor ACKed 0x5A but mlx.begin() failed. Check power stability.");
          }
        } else if (addr == 0x57) {
          Serial.println(" <-- MAX30102 Sensor");
          count++;
        } else {
          Serial.println(" <-- Unknown I2C Device");
          count++;
        }
      }
    }
  }

  if (count == 0) {
    Serial.println("  [!] Zero devices found at any speed (10kHz - 100kHz).");
  }
}

void setup() {
  // 115200 baud
  Serial.begin(115200);
  delay(2000);

  Serial.println();
  Serial.println("==================================================");
  Serial.println(" ESP32 - MLX90614 Sensor Hardware Diagnostic Tool ");
  Serial.println("==================================================");

  // Initialize I2C
  Serial.println("[INIT] Initializing I2C bus on SDA=GPIO 21, SCL=GPIO 22...");
  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.setClock(100000); // 100 kHz standard mode

  // First scan
  scanBus();

  // Try initial MLX90614 begin
  if (mlx.begin()) {
    Serial.println("\n[SUCCESS] MLX90614 driver connected!");
    mlxReady = true;
    Serial.println("--------------------------------------------------");
    Serial.println("Ambient (C)  |  Object (C)   |  Object (F)   | Status");
    Serial.println("--------------------------------------------------");
  } else {
    Serial.println("\n[WAITING] Sensor not ready yet. Retrying in loop...");
  }
}

void loop() {
  unsigned long now = millis();

  // If sensor is not yet responding, keep scanning
  if (!mlxReady) {
    if (now - lastScanTime >= SCAN_INTERVAL) {
      lastScanTime = now;
      
      // Quick probe on 0x5A
      Wire.beginTransmission(0x5A);
      byte err = Wire.endTransmission();

      if (err == 0) {
        Serial.println("\n[FOUND] Sensor ACKed at 0x5A! Initializing driver...");
        if (mlx.begin()) {
          Serial.println("[SUCCESS] MLX90614 ready! Streaming readings...\n");
          mlxReady = true;
          Serial.println("--------------------------------------------------");
          Serial.println("Ambient (C)  |  Object (C)   |  Object (F)   | Status");
          Serial.println("--------------------------------------------------");
          return;
        }
      } else {
        // Run full scan periodically
        scanBus();
      }
    }
    return;
  }

  // Once connected, stream temperature readings every 1 second
  if (now - lastScanTime >= 1000) {
    lastScanTime = now;

    float ambC = mlx.readAmbientTempC();
    float objC = mlx.readObjectTempC();
    float objF = mlx.readObjectTempF();

    if (isnan(ambC) || isnan(objC)) {
      Serial.println("[WARN] Sensor read failed! Re-scanning...");
      mlxReady = false;
      return;
    }

    const char* status = "Normal";
    if (objC < 32.0) status = "No Target";
    else if (objC < 35.5) status = "Low / Hypothermia";
    else if (objC > 38.0) status = "HIGH FEVER ALERT!";
    else if (objC > 37.3) status = "Low-Grade Fever";

    Serial.print("  ");
    Serial.print(ambC, 2);
    Serial.print(" C     |   ");
    Serial.print(objC, 2);
    Serial.print(" C    |   ");
    Serial.print(objF, 2);
    Serial.print(" F   | ");
    Serial.println(status);
  }
}
