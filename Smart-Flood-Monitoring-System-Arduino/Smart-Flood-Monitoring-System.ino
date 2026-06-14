#include <WiFi.h>
#include <FirebaseESP32.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <time.h>

// ================= WIFI =================
#define WIFI_SSID "R1tsu#01"
#define WIFI_PASSWORD "R1tsuTanaka"

// ================= FIREBASE =================
#define FIREBASE_HOST "smart-flood-6f84f-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "1TE98Q5nCDBERVuLnzqbUW1krBaEClImTB8dI8Fa"

// ================= PIN =================
#define TRIG_PIN 5
#define ECHO_PIN 18

// RELAY POMPA PEMBUANGAN
#define RELAY_BUANG 26

// RELAY POMPA TAMBAH AIR
#define RELAY_TAMBAH 27

// ================= LCD =================
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ================= FIREBASE =================
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ================= VARIABLE =================
long durasi;

float jarak;

String statusAir;

String statusPompa = "OFF";

String statusTambahAir = "OFF";

// ================= TIMER =================
bool pompaSedangNyala = false;

unsigned long waktuPompaNyala = 0;

const unsigned long durasiPompa = 10000;

// ================= NTP =================
const char* ntpServer = "pool.ntp.org";

const long gmtOffset_sec = 7 * 3600;

const int daylightOffset_sec = 0;

void setup() {

  Serial.begin(115200);

  // ================= PIN =================
  pinMode(TRIG_PIN, OUTPUT);

  pinMode(ECHO_PIN, INPUT);

  pinMode(RELAY_BUANG, OUTPUT);

  pinMode(RELAY_TAMBAH, OUTPUT);

  // Relay OFF
  digitalWrite(RELAY_BUANG, HIGH);

  digitalWrite(RELAY_TAMBAH, HIGH);

  // ================= LCD =================
  lcd.init();

  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Smart Flood");

  lcd.setCursor(0, 1);
  lcd.print("Starting...");

  delay(2000);

  lcd.clear();

  // ================= WIFI =================
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  lcd.setCursor(0, 0);
  lcd.print("Connecting...");

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");

    lcd.print(".");
  }

  Serial.println("\nWiFi Connected");

  lcd.clear();

  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected");

  delay(2000);

  // ================= TIME =================
  configTime(
    gmtOffset_sec,
    daylightOffset_sec,
    ntpServer
  );

  // ================= FIREBASE =================
  config.host = FIREBASE_HOST;

  config.signer.tokens.legacy_token =
    FIREBASE_AUTH;

  Firebase.begin(&config, &auth);

  Firebase.reconnectWiFi(true);

  lcd.clear();
}

void loop() {

  // ================= ULTRASONIC =================
  digitalWrite(TRIG_PIN, LOW);

  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);

  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

  // ================= BACA ECHO =================
  durasi = pulseIn(ECHO_PIN, HIGH);

  // ================= HITUNG JARAK =================
  jarak = durasi * 0.034 / 2;

  Serial.print("Jarak: ");

  Serial.print(jarak);

  Serial.println(" cm");

  // ================= STATUS AIR =================
  if (jarak <= 35) {

    statusAir = "BAHAYA";

  }
  else if (jarak <= 100) {

    statusAir = "WASPADA";

  }
  else {

    statusAir = "AMAN";

  }

  // ================= POMPA PEMBUANGAN =================
  if (
    (statusAir == "BAHAYA" ||
     statusAir == "WASPADA")
     &&
     !pompaSedangNyala
  ) {

    digitalWrite(RELAY_BUANG, LOW);

    statusPompa = "ON";

    pompaSedangNyala = true;

    waktuPompaNyala = millis();

    Serial.println("Pompa Buang ON");
  }

  // ================= MATIKAN POMPA 10 DETIK =================
  if (
    pompaSedangNyala &&
    millis() - waktuPompaNyala >= durasiPompa
  ) {

    digitalWrite(RELAY_BUANG, HIGH);

    statusPompa = "OFF";

    pompaSedangNyala = false;

    Serial.println("Pompa Buang OFF");
  }

  // ================= TAMBAH AIR DARI WEB =================
  String tambahAir = "";

  if (
    Firebase.getString(
      fbdo,
      "/smartflood/tambah_air"
    )
  ) {

    tambahAir = fbdo.stringData();

    // ================= JIKA TOMBOL DITEKAN =================
    if (tambahAir == "ON") {

      Serial.println("Tambah Air Aktif");

      statusTambahAir = "ON";

      // RELAY TAMBAH AIR ON
      digitalWrite(RELAY_TAMBAH, LOW);

      // ================= LCD COUNTDOWN =================
      for (int sisa = 10; sisa >= 1; sisa--) {

        lcd.clear();

        lcd.setCursor(0, 0);
        lcd.print("Mengisi Air");

        lcd.setCursor(0, 1);
        lcd.print("Sisa ");
        lcd.print(sisa);
        lcd.print(" detik");

        Serial.print("Sisa Waktu: ");
        Serial.println(sisa);

        delay(1000);
      }

      // RELAY OFF
      digitalWrite(RELAY_TAMBAH, HIGH);

      statusTambahAir = "OFF";

      // RESET FIREBASE
      Firebase.setString(
        fbdo,
        "/smartflood/tambah_air",
        "OFF"
      );

      Serial.println("Tambah Air Selesai");
    }
  }

  // ================= AMBIL WAKTU =================
  struct tm timeinfo;

  String tanggal = "-";

  String waktu = "-";

  if (getLocalTime(&timeinfo)) {

    char tanggalBuffer[20];

    char waktuBuffer[20];

    strftime(
      tanggalBuffer,
      sizeof(tanggalBuffer),
      "%d-%m-%Y",
      &timeinfo
    );

    strftime(
      waktuBuffer,
      sizeof(waktuBuffer),
      "%H:%M:%S",
      &timeinfo
    );

    tanggal = String(tanggalBuffer);

    waktu = String(waktuBuffer);
  }

  // ================= LCD NORMAL =================
  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("J:");
  lcd.print(jarak, 1);
  lcd.print("cm");

  lcd.setCursor(0, 1);

  lcd.print(statusPompa);

  lcd.print(" ");

  lcd.print(statusAir);

  // ================= FIREBASE =================
  Firebase.setFloat(
    fbdo,
    "/smartflood/jarak",
    jarak
  );

  Firebase.setString(
    fbdo,
    "/smartflood/status",
    statusAir
  );

  Firebase.setString(
    fbdo,
    "/smartflood/tanggal",
    tanggal
  );

  Firebase.setString(
    fbdo,
    "/smartflood/waktu",
    waktu
  );

  Firebase.setString(
    fbdo,
    "/smartflood/pompa",
    statusPompa
  );

  Firebase.setString(
    fbdo,
    "/smartflood/pompa_tambah",
    statusTambahAir
  );

  // ================= SERIAL =================
  Serial.println("====================");

  Serial.print("Status Air   : ");
  Serial.println(statusAir);

  Serial.print("Pompa Buang  : ");
  Serial.println(statusPompa);

  Serial.print("Tambah Air   : ");
  Serial.println(statusTambahAir);

  Serial.print("Tanggal      : ");
  Serial.println(tanggal);

  Serial.print("Waktu        : ");
  Serial.println(waktu);

  Serial.println("====================");

  delay(1000);
}