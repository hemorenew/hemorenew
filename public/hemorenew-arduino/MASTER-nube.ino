#include <Wire.h>
#include "LiquidCrystal_I2C.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include "Simple_HCSR04.h"
#include "OneWire.h"
#include "DallasTemperature.h"
#include <Ticker.h>
#include <WiFiClientSecure.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>
#include <time.h>
//sensores
#define boton1 39
#define boton2 36
#define pflujo 34
#define boya 35
//bombas
#define resistencia 23
#define bcir 19
#define bin 18
#define bdes 5
#define compresor 4
#define bcolor 0
#define bp 2

//SENSOR de color
int s0 = 26;
int s1 = 27;
int s2 = 14;
int s3 = 13;
int out = 15;
String color="NINGUNO",colorr;
int red,blue,green;

LiquidCrystal_I2C lcd(0x27,16,2);
Simple_HCSR04 sonar(33,32);
int dist;

OneWire pinds(25);
DallasTemperature ds(&pinds);
int temp;

//sensor de flujo
volatile long NumPulsos; //variable para la cantidad de pulsos recibidos
float factor_conversion=7.11; //para convertir de frecuencia a caudal
float LxM;            //Variable que acumula el calculo de Litros por Minuto
Ticker sensor;
void IRAM_ATTR ContarPulsos ()
{ 
  NumPulsos++;  //incrementamos la variable de pulsos
}
void limpiar()
{
  NumPulsos=0;
}
//WIFI
const char* ssid     = "Wifi - Karen"; // SSID ROUTER
const char* password = "obando.2024"; //CONTRASEÑA ROUTER
AsyncWebServer server(80);
//IP DE LA PC CON LA PAGINA WEB
const char* serverName = "http://192.168.1.3/desinfeccion/sensores.php/";
IPAddress ip(192,168,1,20);//IP ESP32
IPAddress gateway(192,168,1,1);//PUERTA DE ENLACE DEL ROUTER de mi computadora.   
IPAddress subnet(255,255,255,0);//MASCAR DEL ROUTER
IPAddress dns(192, 168, 1, 1);//DNS DEL ROUTER
String inputMessage;
//VARIABLES
int k,seg=0;
char sw=0,sw2=0;

WiFiClientSecure wifiClient;
HttpClient httpClient(wifiClient, "hemorenew.vercel.app", 443);

String getCurrentTime() {
  time_t now;
  time(&now);
  now += -4 * 3600; // UTC-4 for Bolivia
  char buf[30];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S.000Z", gmtime(&now));
  return String(buf);
}

void setup() 
{
  delay(1000);
  Serial2.begin(115200);
  pinMode(resistencia, OUTPUT);
  pinMode(bcir, OUTPUT);
  pinMode(bin, OUTPUT);
  pinMode(bdes, OUTPUT);
  pinMode(compresor, OUTPUT);
  pinMode(bcolor, OUTPUT);
  pinMode(bp, OUTPUT);
  digitalWrite(resistencia, 1);
  digitalWrite(bcir, 1);
  digitalWrite(bin, 1);
  digitalWrite(bdes, 1);
  digitalWrite(compresor, 1);
  digitalWrite(bcolor, 1);
  digitalWrite(bp, 1);
  lcd.begin();
  pinMode(s0, OUTPUT);
  pinMode(s1, OUTPUT);
  pinMode(s2, OUTPUT);
  pinMode(s3, OUTPUT);
  pinMode(out, INPUT);
  attachInterrupt(digitalPinToInterrupt(pflujo),ContarPulsos,RISING);//(Interrupción 0(Pin2),función,Flanco de subida)
  pinMode(boya, INPUT);
  pinMode(boton1, INPUT);
  pinMode(boton2, INPUT);
  ds.begin();
  WiFi.config(ip, gateway, subnet,dns);
  WiFi.begin(ssid, password);
  lcd.setCursor(0,0);
  lcd.print("CONECTANDO");
  WiFi.mode(WIFI_STA);
  while(WiFi.status() != WL_CONNECTED) 
  { 
    delay(200);
    lcd.setCursor(k,1);
    lcd.print(".");
    k++;
    if(k>15)
    {
      k=0;
      lcd.setCursor(k,1);
      lcd.print("                ");
    }
  }
  delay(1000);
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("IP ESP32");
  lcd.setCursor(0,1);
  lcd.print(WiFi.localIP());
  delay(1000);
  lcd.clear();
  sensor.attach(1,limpiar);
  wifiClient.setInsecure();
  configTime(0, 0, "pool.ntp.org");
}

void loop() 
{
  //ETAPA DEL MENU
  while(sw==0)
  {
    lcd.setCursor(0,0);
    lcd.print("1.REPROCESAR");
    lcd.setCursor(0,1);
    lcd.print("2.DESINFECTAR");
    if(digitalRead(boton1)==0)
    {
      delay(300);
      sw=1;
      sw2=0;
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("REPROCESAMIENTO");
      delay(2000);
      lcd.clear();
    }
    if(digitalRead(boton2)==0)
    {
      delay(300);
      sw=2;
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("DESINFECCION");
      delay(500);
      Serial2.print("l");
      seg=0;
      digitalWrite(bdes,0);
    }
  }
  //ETAPA DE REPROCESAMIENTO
  while(sw==1)
  {
    lcd.setCursor(0,0);
    lcd.print("TEST DE NIVEL");
    lcd.setCursor(0,1);
    lcd.print("DE AGUA");
    delay(1000);
    seg++;
    if(seg>120)
    {
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("NO HAY");
      lcd.setCursor(0,1);
      lcd.print("SUFICIENTE H20");
      seg=0;
      delay(5000);
      lcd.clear();
    }
    if(digitalRead(boya)==0)//ETAPA PREPARACION
    {
      delay(300);
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("PREPARACION");
      digitalWrite(bcir, 0);
      delay(500);
      digitalWrite(resistencia, 0);
      seg=0;
      while(sw2==0)//lectura de temperatura
      {
        ds.requestTemperatures();
        temp=ds.getTempCByIndex(0);
        lcd.setCursor(0,1);
        lcd.print("TEMPERATURA="+String(temp)+"  ");
        seg++;
        delay(1000);
        if(seg%5==0)
        {
          enviardatos(temp, LxM, dist, color);
          seg=0;
        }
        if(temp>35 && seg>3)
        {
          enviardatos(temp, LxM, dist, color);
          digitalWrite(bcir,1);
          delay(300);
          digitalWrite(resistencia, 1);
          sw2=1;
          seg=0;
          NumPulsos=0;
          lcd.clear();
        }
      }
      while(sw2==1)
      {
        lcd.setCursor(0,0);
        lcd.print("CONEXION FILTRO");
        lcd.setCursor(0,1);
        lcd.print("PRESIONE BOTON");
        if(digitalRead(boton2)==0)
        {
          lcd.clear();
          lcd.setCursor(0,0);
          lcd.print("REINICIANDO");
          lcd.setCursor(0,1);
          lcd.print("SISTEMA");
          sw=0;
          sw2=0;
          seg=0;
          delay(2000);
          lcd.clear();
        }
        if(digitalRead(boton1)==0)
        {
          lcd.clear();
          lcd.setCursor(0,0);
          lcd.print("LAVADO");
          lcd.setCursor(0,1);
          lcd.print("SANGUINEO ");
          sw2=2;
          seg=0;
          delay(1000);
          Serial2.print("a");
          digitalWrite(bin,0);
        }
      }
      while(sw2==2)//lavado sanguineo
      {
        lcd.setCursor(0,0);
        lcd.print("LAVADO");
        lcd.setCursor(0,1);
        lcd.print("SANGUINEO ");
        LxM = (NumPulsos / factor_conversion);
        lcd.print("F="+String(LxM)+"   ");
        seg++;
        delay(1000);
        if(seg%5==0)
        {
          enviardatos(temp, LxM, dist, color);
        }
        if(seg>59)
        {
          enviardatos(temp, LxM, dist, color);
          NumPulsos=0;
          seg=0;
          Serial2.print("b");
          sw2=3;
          delay(1000);
          lcd.clear();
          lcd.setCursor(0,0);
          lcd.print("LAVADO ");
          lcd.setCursor(0,1);
          lcd.print("DIALIZADO ");
        }
      }
      while(sw2==3)//lavado dializado
      {
        lcd.setCursor(0,0);
        lcd.print("LAVADO ");
        lcd.setCursor(0,1);
        lcd.print("DIALIZADO ");
        LxM = (NumPulsos / factor_conversion);
        lcd.print("F="+String(LxM)+"   ");
        seg++;
        delay(1000);
        if(seg%5==0)
        {
          enviardatos(temp, LxM, dist, color);
        }
        if(seg>60)
        {
          enviardatos(temp, LxM, dist, color);
          NumPulsos=0;
          seg=0;
          Serial2.print("c");
          sw2=4;
          delay(1000);
          lcd.clear();
          lcd.setCursor(0,0);
          lcd.print("ULTRAFILTRACION");
          lcd.setCursor(0,1);
          lcd.print("INVERSA ");
        }
      }
      while(sw2==4)//ULTRAFILTRACION
      {
        lcd.setCursor(0,0);
        lcd.print("ULTRAFILTRACION");
        lcd.setCursor(0,1);
        lcd.print("INVERSA ");
        LxM = (NumPulsos / factor_conversion);
        lcd.print("F="+String(LxM)+"   ");
        seg++;
        delay(1000);
        if(seg%5==0)
        {
          enviardatos(temp, LxM, dist, color);
        }
        if(seg>240)
        {
          enviardatos(temp, LxM, dist, color);
          seg=0;
          Serial2.print("d");
          sw2=5;
          digitalWrite(bin,1);
          delay(100);
          digitalWrite(bcolor,0);
          delay(1000);
          lcd.clear();
          lcd.setCursor(0,0);
          lcd.print("INTEGRIDAD");
        }
      }
      while(sw2==5)//INTEGRIDAD
      {
        lcd.setCursor(0,0);
        lcd.print("INTEGRIDAD");
        lcd.setCursor(0,1);
        color=lectura_colores();
        lcd.print("COLOR="+color+"          ");
        seg++;
        delay(1000);
        if(seg%5==0)
        {
          enviardatos(temp, LxM, dist, color);
        }
        if(seg>59)
        {
          seg=0;
          Serial2.print("e");
          sw2=6;
          digitalWrite(bcolor,1);
          delay(1000);
          digitalWrite(bin,0);
          lcd.clear();
          if(color=="ROJO")
          {
            enviardatos(temp, LxM, dist, color);
            lcd.setCursor(0,0);
            lcd.print("NO PASO TEST");
            Serial2.print("f");
            delay(2000);
            lcd.clear();
            lcd.setCursor(0,0);
            lcd.print("ACLARADO");
            lcd.setCursor(0,1);
            lcd.print("SANGUINEO ");
            colorr="";
          }
          else
          {
            enviardatos(temp, LxM, dist, color);
            lcd.setCursor(0,0);
            lcd.print("PASO TEST");
            lcd.setCursor(0,1);
            lcd.print("INTEGRIDAD");
            delay(2000);
            lcd.clear();
            lcd.setCursor(0,0);
            lcd.print("ACLARADO");
            lcd.setCursor(0,1);
            lcd.print("SANGUINEO ");
            colorr="";
          }
        }
      }
      while(sw2==6)//aclarado SANGUINEO
      {
        lcd.setCursor(0,0);
        lcd.print("ACLARADO");
        lcd.setCursor(0,1);
        lcd.print("SANGUINEO ");
        LxM = (NumPulsos / factor_conversion);
        lcd.print("F="+String(LxM)+"   ");
        seg++;
        delay(1000);
        if(seg%5==0)
        {
          enviardatos(temp, LxM, dist, color);
        }
        if(seg>90)
        {
          enviardatos(temp, LxM, dist, color);
          seg=0;
          Serial2.print("g");
          sw2=7;
          delay(1000);
          lcd.clear();
          lcd.setCursor(0,0);
          lcd.print("ACLARADO");
          lcd.setCursor(0,1);
          lcd.print("DIALIZADO ");
        }
      }
      while(sw2==7)//aclarado dializado
      {
        lcd.setCursor(0,0);
        lcd.print("ACLARADO");
        lcd.setCursor(0,1);
        lcd.print("DIALIZADO ");
        LxM = (NumPulsos / factor_conversion);
        lcd.print("F="+String(LxM)+"   ");
        seg++;
        delay(1000);
        if(seg%5==0)
        {
          enviardatos(temp, LxM, dist, color);
        }
        if(seg>90)
        {
          enviardatos(temp, LxM, dist, color);
          seg=0;
          Serial2.print("h");
          sw2=8;
          delay(1000);
          digitalWrite(bin,1);
          delay(100);
          digitalWrite(bp,0);
          lcd.clear();
          lcd.setCursor(0,0);
          lcd.print("TEST VOLUMEN");
          lcd.setCursor(0,1);
          lcd.print("RESIDUAL ");
        }
      }
      while(sw2==8)//medicion volumen residual
      {
        lcd.setCursor(0,0);
        lcd.print("TEST VOLUMEN");
        lcd.setCursor(0,1);
        lcd.print("RESIDUAL ");
        dist=sonar.measure()->cm();
        lcd.print("N="+String(dist)+"   ");
        seg++;
        delay(1000);
        if(seg%5==0)
        {
          enviardatos(temp, LxM, dist, color);
        }
        if(seg>120)
        {
          enviardatos(temp, LxM, dist, color);
          seg=0;
          Serial2.print("i");
          sw2=9;
          delay(1000);
          lcd.clear();
          lcd.setCursor(0,0);
          lcd.print("VACIADO DE");
          lcd.setCursor(0,1);
          lcd.print("FILTRO ");
        }
      }
      while(sw2==9)//vaciado de filtro
      {
        seg++;
        delay(1000);
        if(seg>120)
        {
          seg=0;
          Serial2.print("j");
          delay(100);
          digitalWrite(bp,1);
          delay(100);
          digitalWrite(bdes,0);
          sw2=10;
          delay(1000);
          lcd.clear();
          lcd.setCursor(0,0);
          lcd.print("LLENADO");
          lcd.setCursor(0,1);
          lcd.print("DESINFECTANTE");
        }
      }
      while(sw2==10)//fin
      {
        seg++;
        delay(1000);
        if(seg>60)
        {
          seg=0;
          Serial2.print("k");
          delay(100);
          digitalWrite(bdes,1);
          delay(1000);
          lcd.clear();
          lcd.setCursor(0,0);
          lcd.print("FIN DE");
          lcd.setCursor(0,1);
          lcd.print("PROCESO");
          sw=0;
          sw2=0;
          enviardatos(temp, LxM, dist, color);
          delay(3000);
        }
      }
    }
  }
  while(sw==2)//desinfeccion
  {
    while(sw2==0)
    {
      seg++;
      delay(1000);
      if(seg>30)
      {
        Serial2.print("m");
        seg=0;
        sw2=1;
      }
    }
    while(sw2==1)
    {
      seg++;
      delay(1000);
      if(seg>30)
      {
        Serial2.print("n");
        lcd.setCursor(0,1);
        seg=0;
        lcd.print("10 MINUTOS");
        digitalWrite(bdes,1);
        sw2=3;
      }
    }
    while(sw2==3)
    {
      seg++;
      delay(1000);
      if(seg>600)
      {
        Serial2.print("o");
        digitalWrite(bin,0);
        lcd.setCursor(0,1);
        lcd.print("2 MINUTOS  ");
        sw2=4;
        seg=0;
        delay(200);
      }
    }
    while(sw2==4)
    {
      seg++;
      delay(1000);
      if(seg>120)
      {
        Serial2.print("p");
        lcd.setCursor(0,1);
        lcd.print("2 MINUTOS  ");
        sw2=5;
        seg=0;
        delay(200);
      }
    }
    while(sw2==5)
    {
      seg++;
      delay(1000);
      if(seg>120)
      {
        Serial2.print("q");
        sw2=0;
        seg=0;
        sw=0;
        digitalWrite(bin,1);
        lcd.clear();
        lcd.setCursor(0,0);
        lcd.print("DESINFECCION");
        lcd.setCursor(0,1);
        lcd.print("FINALIZADA");
        delay(200);
        Serial2.print("r");
        delay(60000);
        Serial2.print("s");
      }
    }
  }
}

void enviardatos(float temp, float flujo, int nivel, String color) {
  String currentTime = getCurrentTime();
  
  // Temperature
  DynamicJsonDocument tempDoc(1024);
  tempDoc["name"] = "prototipo1";
  tempDoc["value"] = temp;
  tempDoc["date"] = currentTime;
  
  String tempPayload;
  serializeJson(tempDoc, tempPayload);
  sendRequest("/api/v1/temperatures", tempPayload);
  delay(100);

  // Flow
  DynamicJsonDocument flowDoc(1024);
  flowDoc["name"] = "prototipo1";
  flowDoc["value"] = flujo;
  flowDoc["date"] = currentTime;
  
  String flowPayload;
  serializeJson(flowDoc, flowPayload);
  sendRequest("/api/v1/flows", flowPayload);
  delay(100);

  // Color
  DynamicJsonDocument colorDoc(1024);
  colorDoc["name"] = "prototipo1";
  colorDoc["value"] = color;
  colorDoc["date"] = currentTime;
  
  String colorPayload;
  serializeJson(colorDoc, colorPayload);
  sendRequest("/api/v1/colors", colorPayload);
  delay(100);

  // Ultrasound
  DynamicJsonDocument ultraDoc(1024);
  ultraDoc["name"] = "prototipo1";
  ultraDoc["value"] = nivel;
  ultraDoc["date"] = currentTime;
  
  String ultraPayload;
  serializeJson(ultraDoc, ultraPayload);
  sendRequest("/api/v1/ultrasounds", ultraPayload);
}

void sendRequest(const char* endpoint, String payload) {
  httpClient.beginRequest();
  httpClient.post(endpoint);
  httpClient.sendHeader("Content-Type", "application/json");
  httpClient.sendHeader("Content-Length", payload.length());
  httpClient.beginBody();
  httpClient.print(payload);
  httpClient.endRequest();

  httpClient.stop();
}

void colores()
{
  digitalWrite(s0, 1);
  digitalWrite(s1, 1);
  digitalWrite(s2, 0);
  digitalWrite(s3, 0);
  //count OUT, pRed, RED
  red = pulseIn(out, digitalRead(out) == HIGH ? LOW : HIGH);
  digitalWrite(s3, 1);
  //count OUT, pBLUE, BLUE
  blue = pulseIn(out, digitalRead(out) == HIGH ? LOW : HIGH);
  digitalWrite(s2, 1);
  //count OUT, pGreen, GREEN
  green = pulseIn(out, digitalRead(out) == HIGH ? LOW : HIGH);
}

String lectura_colores()
{
  colores();
  if (red < blue && red < green && red < 25)
  {
    if (red>=19 && red<=24)
    {
      if (green>=37 && green<=46)
      {
        if (blue>=9 && blue<=12)
        {
          colorr="CAFE";
        }
      } 
    }
    if (green - blue >= 10 && green - blue <= 25 && green - ( 2 * red ) >= 8 )
    {
      colorr="ROJO";
    }
    else if (green - red <= 10 && green - red >= -3 && blue >= green)
    {
      colorr="AMARILLO";
    }
    else if (blue - red >= 3 && blue - red <= 10 &&  green - ( 2 * red ) <= 5)
    {
      colorr="ROSADO";
    }
    else if (green - blue >= -5 && green - blue <= 5 && green - ( 2 * red ) <= 5 )
    {
      colorr="NARANJA";
    }
  }
  else if (green < red && green < blue && green < 25)
  {
    colorr="VERDE";
  }
  else if ((red > green &&  blue < green) && blue < 25 && red > 40)
  {
    colorr="AZUL";
  }
  else if (red - (2 * blue) >= -2 && red - (2 * blue) <= 5 && green - red < 10)
  {
    colorr="PURPURA";
  }
  else if (blue < red && blue < green && (blue && red && green) < 25)
  {
    if (red - green <= 5 && red - green >= 0 && ((green - blue) || (red - blue)) < 5 && blue < 50)
    {
      colorr="BLANCO";
    }
  }
  else 
  {
    colorr="NINGUNO";
  }
  return colorr;
}
