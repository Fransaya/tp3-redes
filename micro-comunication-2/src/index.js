import { login, startTokenMonitor } from "./authManager.js";
import { startWebSocketServer } from "./websocketServer.js";


async function init() {
  await login();            // 1. Login inicial
  startTokenMonitor();      // 2. Scheduler para refresh
  startWebSocketServer();  // 3. Iniciar WS server
  console.log("[Service] Servicio inicializado ✅");
}
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
init();
