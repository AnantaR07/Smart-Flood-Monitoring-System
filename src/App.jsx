import React, { useEffect, useState } from "react";

import { initializeApp } from "firebase/app";

import { getDatabase, ref, onValue } from "firebase/database";

import { set } from "firebase/database";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "smart-flood-6f84f.firebaseapp.com",
  databaseURL:
    "https://smart-flood-6f84f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-flood-6f84f",
  storageBucket: "smart-flood-6f84f.appspot.com",
  messagingSenderId: "XXXXXXXX",
  appId: "XXXXXXXX",
};

// ================= INIT FIREBASE =================
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

export default function FloodMonitoring() {
  // ================= STATE =================
  const [tinggiAir, setTinggiAir] = useState(0);

  const [statusFirebase, setStatusFirebase] = useState("MENUNGGU DATA");

  const [tanggalFirebase, setTanggalFirebase] = useState("-");

  const [waktuFirebase, setWaktuFirebase] = useState("-");

  const [statusPompa, setStatusPompa] = useState("OFF");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ================= AMBIL DATA FIREBASE =================
  useEffect(() => {
    const jarakRef = ref(database, "smartflood/jarak");

    const statusRef = ref(database, "smartflood/status");

    const tanggalRef = ref(database, "smartflood/tanggal");

    const waktuRef = ref(database, "smartflood/waktu");

    const pompaRef = ref(database, "smartflood/pompa");

    // ================= JARAK =================
    onValue(jarakRef, (snapshot) => {
      const data = snapshot.val();

      if (data !== null) {
        setTinggiAir(data);
      }
    });

    // ================= STATUS =================
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();

      if (data !== null) {
        setStatusFirebase(data);
      }
    });

    // ================= TANGGAL =================
    onValue(tanggalRef, (snapshot) => {
      const data = snapshot.val();

      if (data !== null) {
        setTanggalFirebase(data);
      }
    });

    // ================= WAKTU =================
    onValue(waktuRef, (snapshot) => {
      const data = snapshot.val();

      if (data !== null) {
        setWaktuFirebase(data);
      }
    });

    // ================= POMPA =================
    onValue(pompaRef, (snapshot) => {
      const data = snapshot.val();

      if (data !== null) {
        setStatusPompa(data);
      }
    });
  }, []);

  // ================= RESPONSIVE =================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ================= STATUS =================
  let status = statusFirebase;

  let warna = "";

  let gradient = "";

  let icon = "";

  if (status === "AMAN") {
    warna = "#00c853";

    gradient = "linear-gradient(135deg, #00c853, #64dd17)";

    icon = "🟢";
  } else if (status === "WASPADA") {
    warna = "#ffab00";

    gradient = "linear-gradient(135deg, #ffab00, #ff6f00)";

    icon = "🟡";
  } else {
    warna = "#ff1744";

    gradient = "linear-gradient(135deg, #ff1744, #d50000)";

    icon = "🔴";
  }

  return (
    <div style={styles.body}>
      <style>
        {`
        @keyframes waveFlow {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes floating {
          0% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-8px);
          }

          100% {
            transform: translateY(0px);
          }
        }
 @keyframes gradientMove {
      0% {
        background-position: 0% 50%;
      }

      50% {
        background-position: 100% 50%;
      }

      100% {
        background-position: 0% 50%;
      }
    }

    @keyframes bubbleFloat {
      0% {
        transform: translateY(0px);
      }

      50% {
        transform: translateY(-20px);
      }

      100% {
        transform: translateY(0px);
      }
    }

    @keyframes pulseGlow {
      0% {
        box-shadow: 0 0 20px rgba(0,255,255,0.15);
      }

      50% {
        box-shadow: 0 0 40px rgba(0,255,255,0.35);
      }

      100% {
        box-shadow: 0 0 20px rgba(0,255,255,0.15);
      }
    }

      `}
      </style>
      <div
        style={{
          ...styles.container,
          flexDirection: isMobile ? "column-reverse" : "row",
          padding: isMobile ? "25px" : "40px",
          gap: isMobile ? "30px" : "50px",
        }}
      >
        {/* ================= KIRI ================= */}
        <div style={styles.leftSection}>
          <h1
            style={{
              ...styles.title,
              fontSize: isMobile ? "26px" : "36px",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            Smart Flood Monitoring
          </h1>

          <p
            style={{
              ...styles.subtitle,
              fontSize: isMobile ? "14px" : "16px",
              lineHeight: isMobile ? "24px" : "28px",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            Sistem Pemantauan Ketinggian Air Secara Real-Time.
          </p>

          {/* ================= STATUS ================= */}
          <div
            style={{
              ...styles.statusBox,
              padding: isMobile ? "18px" : "22px",
            }}
          >
            <div>
              <h3 style={styles.statusLabel}>Status Saat Ini</h3>

              <h2 style={styles.statusText}>{status}</h2>
            </div>

            <div style={styles.icon}>{icon}</div>
          </div>

          {/* ================= INFO ================= */}
          <div
            style={{
              ...styles.info,
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* CARD TANGGAL */}
            <div style={styles.infoCard}>
              <div style={styles.infoLeft}>
                <div style={styles.iconBox}>📅</div>

                <div>
                  <p style={styles.infoTitle}>Tanggal</p>

                  <h3 style={styles.infoValue}>{tanggalFirebase}</h3>
                </div>
              </div>
            </div>

            {/* CARD WAKTU */}
            <div style={styles.infoCard}>
              <div style={styles.infoLeft}>
                <div style={styles.iconBox}>⏰</div>

                <div>
                  <p style={styles.infoTitle}>Waktu</p>

                  <h3 style={styles.infoValue}>{waktuFirebase}</h3>
                </div>
              </div>
            </div>

            {/* CARD STATUS POMPA */}
            <div style={styles.infoCard}>
              <div style={styles.infoLeft}>
                <div style={styles.iconBox}>💧</div>

                <div>
                  <p style={styles.infoTitle}>Status Pompa</p>

                  <h3
                    style={{
                      ...styles.infoValue,

                      color: statusPompa === "ON" ? "#00ffae" : "#ff5c5c",
                    }}
                  >
                    {statusPompa}
                  </h3>
                </div>
              </div>

              {/* BULATAN STATUS */}
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: statusPompa === "ON" ? "#00ffae" : "#ff5c5c",

                  boxShadow:
                    statusPompa === "ON"
                      ? "0 0 15px #00ffae"
                      : "0 0 15px #ff5c5c",
                }}
              />
            </div>
          </div>
        </div>

        {/* ================= KANAN ================= */}
        <div
          style={{
            ...styles.rightSection,
            flexDirection: "column",
            gap: "25px",
          }}
        >
          {/* ================= WATER CARD ================= */}
          <div
            style={{
              ...styles.waterCard,

              width: isMobile ? "240px" : "320px",

              height: isMobile ? "240px" : "320px",

              boxShadow: `inset 0 0 20px rgba(255,255,255,0.2),
                                                        0 0 40px ${warna}`,
            }}
          >
            {/* ================= WAVE ================= */}
            <div style={styles.waveContainer}>
              <div style={styles.waveTrack}>
                <svg
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                  style={styles.waveSvg}
                >
                  <path
                    d="
    M0,40
    C150,90 350,0 600,40
    C850,80 1050,10 1200,40
    L1200,120
    L0,120
    Z
  "
                    fill={warna}
                  />
                </svg>

                <svg
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                  style={styles.waveSvg}
                >
                  <path
                    d="
    M0,40
    C150,90 350,0 600,40
    C850,80 1050,10 1200,40
    L1200,120
    L0,120
    Z
  "
                    fill={warna}
                  />
                </svg>
              </div>
            </div>

            {/* ================= CONTENT ================= */}
            <div style={styles.content}>
              <h1
                style={{
                  ...styles.airText,

                  fontSize: isMobile ? "42px" : "65px",
                }}
              >
                {tinggiAir.toFixed(1)} cm
              </h1>

              <p style={styles.airLabel}>Tinggi Air</p>
            </div>
          </div>

          {/* ================= BUTTON ================= */}
          <button
            style={{
              ...styles.button,

              background: gradient,

              width: isMobile ? "100%" : "260px",
            }}
            onClick={async () => {
              // kirim perintah ke firebase
              await set(ref(database, "smartflood/tambah_air"), "ON");
            }}
          >
            🔄 Tambah Air
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= STYLES =================
// ================= STYLES =================
const styles = {
  body: {
    minHeight: "100vh",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    padding: "clamp(12px, 3vw, 20px)",

    position: "relative",

    overflow: "hidden",

    background: "linear-gradient(135deg, #001f3f, #003566, #00509d, #001d3d)",

    backgroundSize: "400% 400%",

    animation: "gradientMove 15s ease infinite",

    fontFamily: "Poppins, sans-serif",
  },

  container: {
    width: "100%",

    maxWidth: "1100px",

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    gap: "clamp(20px, 5vw, 50px)",

    background: "rgba(255,255,255,0.12)",

    backdropFilter: "blur(15px)",

    borderRadius: "clamp(20px, 4vw, 35px)",

    color: "white",

    padding: "clamp(20px, 4vw, 40px)",

    boxSizing: "border-box",

    flexWrap: "wrap",
  },

  leftSection: {
    flex: "1 1 350px",

    width: "100%",
  },

  title: {
    fontWeight: "700",

    fontSize: "clamp(24px, 5vw, 42px)",

    lineHeight: "1.2",

    marginBottom: "12px",
  },

  subtitle: {
    opacity: 0.8,

    marginBottom: "clamp(20px, 4vw, 35px)",

    fontSize: "clamp(14px, 2vw, 16px)",

    lineHeight: "clamp(22px, 3vw, 28px)",
  },

  statusBox: {
    background: "rgba(255,255,255,0.12)",

    borderRadius: "clamp(18px, 3vw, 25px)",

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    padding: "clamp(16px, 3vw, 22px)",

    marginBottom: "clamp(18px, 3vw, 25px)",

    gap: "15px",
  },

  statusLabel: {
    opacity: 0.7,

    fontSize: "clamp(14px, 2vw, 16px)",
  },

  statusText: {
    fontWeight: "700",

    fontSize: "clamp(22px, 4vw, 34px)",

    marginTop: "5px",

    wordBreak: "break-word",
  },

  icon: {
    fontSize: "clamp(35px, 6vw, 55px)",
  },

  info: {
    background: "rgba(255,255,255,0.08)",

    borderRadius: "clamp(16px, 3vw, 20px)",

    padding: "clamp(15px, 3vw, 20px)",

    lineHeight: "clamp(24px, 3vw, 30px)",

    marginBottom: "clamp(20px, 3vw, 25px)",

    fontSize: "clamp(13px, 2vw, 16px)",
  },

  button: {
    padding: "clamp(14px, 2vw, 16px) clamp(20px, 3vw, 28px)",

    border: "none",

    borderRadius: "clamp(14px, 2vw, 18px)",

    color: "white",

    fontWeight: "600",

    cursor: "pointer",

    fontSize: "clamp(14px, 2vw, 16px)",

    transition: "0.3s",
  },

  rightSection: {
    flex: "1 1 320px",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    width: "100%",
  },

  waterCard: {
    position: "relative",

    borderRadius: "50%",

    overflow: "hidden",

    width: "clamp(220px, 45vw, 320px)",

    height: "clamp(220px, 45vw, 320px)",

    border: "6px solid rgba(255,255,255,0.2)",

    animation: "floating 3s ease-in-out infinite",
  },

  content: {
    position: "absolute",

    width: "100%",

    height: "100%",

    display: "flex",

    flexDirection: "column",

    justifyContent: "center",

    alignItems: "center",

    zIndex: 10,

    color: "white",

    textAlign: "center",
  },

  airText: {
    fontWeight: "700",

    fontSize: "clamp(38px, 8vw, 65px)",

    lineHeight: "1",
  },

  airLabel: {
    fontSize: "clamp(15px, 3vw, 20px)",

    marginTop: "10px",
  },

  waveContainer: {
    position: "absolute",

    bottom: 0,

    width: "100%",

    height: "55%",

    overflow: "hidden",
  },

  waveTrack: {
    display: "flex",

    width: "200%",

    height: "100%",

    animation: "waveFlow 4s linear infinite",
  },

  waveSvg: {
    width: "50%",

    height: "100%",

    flexShrink: 0,
  },

  infoCard: {
    background: "rgba(255,255,255,0.08)",

    border: "1px solid rgba(255,255,255,0.08)",

    borderRadius: "18px",

    padding: "16px 18px",

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    backdropFilter: "blur(10px)",

    transition: "0.3s",

    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },

  infoLeft: {
    display: "flex",

    alignItems: "center",

    gap: "14px",
  },

  iconBox: {
    width: "50px",

    height: "50px",

    borderRadius: "14px",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    fontSize: "22px",

    background: "rgba(255,255,255,0.12)",

    boxShadow: "inset 0 0 10px rgba(255,255,255,0.08)",
  },

  infoTitle: {
    fontSize: "13px",

    opacity: 0.7,

    marginBottom: "4px",
  },

  infoValue: {
    fontSize: "17px",

    fontWeight: "700",

    margin: 0,
  },
};
