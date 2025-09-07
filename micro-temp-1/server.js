import express from "express";
import dotenv from "dotenv";
import temperatureRoutes from "./routes/temperatureRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { login, refreshAccessToken } from "./auth.js";
import { getRefreshToken, isTokenExpired } from "./utils/tokenManager.js";

import http from "http";

dotenv.config();

// Funcion de conexion de ws
import { connectAndSend } from "./websocket.js";

const app = express();
const port = 3005;

const server = http.createServer(app);

function scheduleRefresh(expiresIn) {
  // margen de seguridad: refrescar 1 minuto antes de que expire
  const SAFE_MARGIN = 60; // segundos
  const refreshDelay = (expiresIn - SAFE_MARGIN) * 1000;

  console.log(`[Scheduler] Próximo refresh en ${refreshDelay / 1000} segundos`);

  setTimeout(async () => {
    try {
      const { accessToken } = await refreshAccessToken();
      console.log("[Scheduler] Access token refrescado:", accessToken);

      scheduleRefresh(3600);
    } catch (err) {
      console.error("[Scheduler] Error al refrescar:", err.message);
    }
  }, refreshDelay);
}

// --- flujo inicial ---
const data = await login();

// Conectar al WebSocket con el accessToken
connectAndSend(data.accessToken);
console.log("RefreshToken inicial:", getRefreshToken());

scheduleRefresh(data.expiresIn || 3600);

// Rutas
app.use("/", temperatureRoutes);
app.use("/", authRoutes);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
