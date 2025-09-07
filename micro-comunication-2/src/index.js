import express from "express";
import { login, startTokenMonitor } from "./authManager.js";
import { startWebSocketServer } from "./websocketServer.js";

const app = express();
const port = 3006; // Usa el puerto que prefieras

async function init() {
  await login();            // 1. Login inicial
  startTokenMonitor();      // 2. Scheduler para refresh
  startWebSocketServer();   // 3. Iniciar WS server
  console.log("[Service] Servicio inicializado ✅");
}

// Endpoint de health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`[Service] Servidor escuchando en http://localhost:${port}`);
});

init();
