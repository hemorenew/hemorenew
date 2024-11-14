

#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoHttpClient.h>
#include <HCSR04.h>
#include <ArduinoJson.h>
#include <deque>
#include <numeric>
#include <cmath>

// Información de WiFi
const char* ssid = "t1";
const char* password = "cisternat1";

// Pines del sensor
const byte triggerPin = 5; //D1
const byte echoPin = 4;   //D2
UltraSonicDistanceSensor distanceSensor(triggerPin, echoPin);

// Configuración del cliente WiFi y HTTP
WiFiClientSecure wifiClient;
HttpClient httpClient = HttpClient(wifiClient, "cisterna.vercel.app", 443);

// Configuración de la filtración y umbral
const size_t numReadings = 6;
const size_t thresholdReadings = 5;
std::deque<float> readings; 
std::deque<float> thresholdValues; 
const float thresholdPercentage = 15.0;
unsigned long previousMillis = 0;
const long interval = 30000;  // intervalo de 30 segundos

void setup() {
  Serial.begin(115200);
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected");
  wifiClient.setInsecure(); 
}

void loop() {
  unsigned long currentMillis = millis();
  float distance = distanceSensor.measureDistanceCm();
  int roundedDistance = round(distance);

  if(readings.size() >= numReadings) {
    readings.pop_front();
  }
  readings.push_back(roundedDistance);

  // Calcular la media y la desviación estándar
  float sum = std::accumulate(readings.begin(), readings.end(), 0.0);
  float mean = sum / readings.size();
  float sq_sum = std::inner_product(readings.begin(), readings.end(), readings.begin(), 0.0);
  float stdev = std::sqrt(sq_sum / readings.size() - mean * mean);

  // Filtrar las lecturas anómalas
  std::deque<float> filteredReadings;
  for (float val : readings) {
    if (std::abs(val - mean) <= 2 * stdev) { 
      filteredReadings.push_back(val);
    }
  }

  // Calcular smoothedValue con lecturas filtradas
  float filteredSum = std::accumulate(filteredReadings.begin(), filteredReadings.end(), 0.0);
  float smoothedValue = filteredSum / filteredReadings.size();

  // Calcular y comparar con el umbral
  if(thresholdValues.size() >= thresholdReadings) {
    float thresholdSum = std::accumulate(thresholdValues.begin(), thresholdValues.end(), 0.0);
    float thresholdAverage = thresholdSum / thresholdValues.size();
    float deviationThreshold = (thresholdPercentage / 100.0) * thresholdAverage;

    if(abs(smoothedValue - thresholdAverage) <= deviationThreshold) {
      if(currentMillis - previousMillis >= interval) {
        previousMillis = currentMillis;

        thresholdValues.pop_front();
        thresholdValues.push_back(smoothedValue);

        Serial.print("Valor enviado: ");
        Serial.println(smoothedValue);

        // Enviar smoothedValue a la base de datos
        DynamicJsonDocument doc(1024);
        doc["name"] = "T3";
        doc["value"] = round(smoothedValue);
        doc["level"] = "651064fd2c5c74c7cf1d1f0b";
            
        String payload;
        serializeJson(doc, payload);
      
        httpClient.beginRequest();
        httpClient.post("/api/tanks");
        httpClient.sendHeader("Content-Type", "application/json");
        httpClient.sendHeader("Content-Length", payload.length());
        httpClient.beginBody();
        httpClient.print(payload);
        httpClient.endRequest();
      
        int statusCode = httpClient.responseStatusCode();
        String response = httpClient.responseBody();
      
        Serial.print("Status code: ");
        Serial.println(statusCode);
        Serial.print("Response: ");
        Serial.println(response);
      }
    } else {
      Serial.println("Valor anómalo detectado, ignorando...");
    }
  } else {
    thresholdValues.push_back(smoothedValue);
  }

  delay(5000);  // Intervalo entre lecturas del sensor
}
