#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>
#include <time.h>

// WiFi credentials
const char* ssid = "Wifi - Karen";
const char* password = "obando.2024";

// Test values
float temp = 25.5;
float flow = 10.2;
String color = "ROJO";
int distance = 15;

WiFiClientSecure wifiClient;
HttpClient httpClient(wifiClient, "hemorenew.vercel.app", 443);

// Get current time for Bolivia (UTC-4)
String getCurrentTime() {
  time_t now;
  time(&now);
  now += -4 * 3600; // UTC-4 for Bolivia
  char buf[30];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S.000Z", gmtime(&now));
  return String(buf);
}

void setup() {
  Serial.begin(115200);
  
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  wifiClient.setInsecure();

  // Initialize time
  configTime(0, 0, "pool.ntp.org");
}

void loop() {
  String currentTime = getCurrentTime();
  
  // Temperature
  DynamicJsonDocument tempDoc(1024);
  tempDoc["name"] = "prototipo1";
  tempDoc["value"] = temp;
  tempDoc["date"] = currentTime;
  
  String tempPayload;
  serializeJson(tempDoc, tempPayload);
  sendRequest("/api/v1/temperatures", tempPayload);
  delay(1000);

  // Flow
  DynamicJsonDocument flowDoc(1024);
  flowDoc["name"] = "prototipo1";
  flowDoc["value"] = flow;
  flowDoc["date"] = currentTime;
  
  String flowPayload;
  serializeJson(flowDoc, flowPayload);
  sendRequest("/api/v1/flows", flowPayload);
  delay(1000);

  // Color
  DynamicJsonDocument colorDoc(1024);
  colorDoc["name"] = "prototipo1";
  colorDoc["value"] = color;
  colorDoc["date"] = currentTime;
  
  String colorPayload;
  serializeJson(colorDoc, colorPayload);
  sendRequest("/api/v1/colors", colorPayload);
  delay(1000);

  // Ultrasound
  DynamicJsonDocument ultraDoc(1024);
  ultraDoc["name"] = "prototipo1";
  ultraDoc["value"] = distance;
  ultraDoc["date"] = currentTime;
  
  String ultraPayload;
  serializeJson(ultraDoc, ultraPayload);
  sendRequest("/api/v1/ultrasounds", ultraPayload);

  delay(10000);
}

void sendRequest(const char* endpoint, String payload) {
  httpClient.beginRequest();
  httpClient.post(endpoint);
  httpClient.sendHeader("Content-Type", "application/json");
  httpClient.sendHeader("Content-Length", payload.length());
  httpClient.beginBody();
  httpClient.print(payload);
  httpClient.endRequest();

  int statusCode = httpClient.responseStatusCode();
  String response = httpClient.responseBody();

  Serial.printf("Endpoint: %s\n", endpoint);
  Serial.printf("Status: %d\n", statusCode);
  Serial.printf("Response: %s\n", response.c_str());

  httpClient.stop();
}