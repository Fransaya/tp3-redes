import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Cargar variables de entorno

const WS_PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET; // Leer JWT_SECRET desde .env

export function startWebSocketServer() {
  const wss = new WebSocketServer({ port: WS_PORT });

  wss.on("connection", (ws, req) => {
    // 1. Extraer Authorization del header
    const authHeader = req.headers["authorization"];
    console.log("ws", ws);
    console.log("req", req);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[WS] ❌ Conexión rechazada: falta token");
      ws.close(1008, "Unauthorized"); // policy violation
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      // 2. Validar JWT
      const decoded = jwt.verify(token, JWT_SECRET);

      console.log("[WS] ✅ Conexión aceptada. User:", decoded.username);

      // 3. Manejo de mensajes
      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log("[WS] Mensaje recibido:", data);

          // acá luego hacés el forward a Micro 3
        } catch (err) {
          console.error("[WS] Error procesando mensaje:", err.message);
        }
      });
    } catch (err) {
      console.log("err", err);
      console.log("[WS] ❌ Token inválido:", err.message);
      ws.close(1008, "Unauthorized");
    }
  });

  console.log(
    `[WS] Servidor WebSocket escuchando en ws://localhost:${WS_PORT}`
  );
}
