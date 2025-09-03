import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { forwardToMicro3 } from "./forwarder.js";

dotenv.config(); // Cargar variables de entorno

const WS_PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET; // Leer JWT_SECRET desde .env

export function startWebSocketServer() {
  const wss = new WebSocketServer({ port: WS_PORT });

  wss.on("connection", (ws, req) => {
    // 1. Extraer Authorization del header
    const authHeader = req.headers["authorization"];
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
      ws.on("message", async (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log("[WS] Mensaje recibido:", data);

          // Verificar si el mensaje es un array
          if (Array.isArray(data)) {
            for (const item of data) {
              const transformedItem = transformToMicro3Format(item);
              console.log("Mandando:", transformedItem);
              await forwardToMicro3(transformedItem);
            }
          } else {
            const transformedItem = transformToMicro3Format(data);
            await forwardToMicro3(transformedItem);
          }

        } catch (err) {
      
          console.error("[WS] Error procesando mensaje:", err.message);
        }
      });

    } catch (err) {
      console.log("[WS] ❌ Token inválido:", err);
      ws.close(1008, "Unauthorized");
    }
  });

  console.log(`[WS] Servidor WebSocket escuchando en ws://localhost:${WS_PORT}`);
}

// Función para transformar el formato del JSON
function transformToMicro3Format(item) {
  return {
    source: "http_receiver_service",
    city: item.city,
    value_c: item.temperature, // Cambiar "temperature" a "value_c"
    captured_at: item.captured_at,
    trace_id: item.trace_id,
  };
}