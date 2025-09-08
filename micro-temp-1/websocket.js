import dotenv from "dotenv";
import WebSocket from "ws";

dotenv.config();

const WS_URL = process.env.WS_URL;
const TOKEN = process.env.BEARER_TOKEN || "TU_BEARER_TOKEN";
const INTERVAL_MS = Number(process.env.SEND_INTERVAL_MS) || 30000;
const LOCAL_ENDPOINT =
  process.env.LOCAL_TEMPERATURES_ENDPOINT ||
  "http://localhost:3005/temperaturas";

import { getTemperatureRefactoring } from "./controllers/temperatureController.js";

let ws;
let sendInterval;

let accessTokenLocal = null;
let tokenExpiryLocal = null;
let refreshTokenLocal = null;

import {
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  setTokens,
} from "./utils/tokenManager.js";

export function connectAndSend(token) {
  ws = new WebSocket(WS_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  ws.on("open", () => {
    console.log("Conectado al WebSocket:", WS_URL);
    accessTokenLocal = getAccessToken();
    refreshTokenLocal = getRefreshToken();

    // Enviar el array obtenido desde /temperaturas cada INTERVAL_MS
    sendInterval = setInterval(() => {
      // envolver en IIFE async para usar await dentro de setInterval
      (async () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        // Manejo de expiracion de token
        if (isTokenExpired(tokenExpiryLocal)) {
          //* si expiro renueva el token ( hace un await para esperara a que se renueve )
          // Generacion de nuevo token
          // ! aca tenes que agregar el enpoint de refresh
          console.log("Token expirado, obteniendo nuevo token...");
          // const newTokens = await refreshAccessToken(refreshTokenLocal);
          // if (newTokens) {
          //   accessTokenLocal = newTokens.accessToken;
          //   refreshTokenLocal = newTokens.refreshToken;
          //   tokenExpiryLocal = Date.now() + newTokens.expiresIn * 1000; // actualizar expiracion //! esto tengo duda no se si iria asi
          //   console.log("Nuevo Access Token:", accessTokenLocal);
          // setTokens({accessTokenLocal, refreshTokenLocal, expiresIn: newTokens.expiresIn});

          // } else {
          //   console.error("No se pudo refrescar el token, abortando envío.");
          //   return;
          // }
        }

        try {
          const resp = await getTemperatureRefactoring();
          console.log("res in func", resp);
          if (!resp) {
            console.error(
              "No se pudo obtener las temperaturas, abortando envío."
            );
            return;
          }
          const data = resp; // debe ser un array con 3 JSONs
          // const data = await resp.json(); // debe ser un array con 3 JSONs
          ws.send(JSON.stringify(data));
          console.log("Enviado al WS:", data);
        } catch (err) {
          console.error("Error fetch->WS:", err.message || err);
        }
      })();
    }, INTERVAL_MS);
  });

ws.on("close", () => {
  console.log("WebSocket cerrado. Reintentando en 5s...");
  clearInterval(sendInterval);
  setTimeout(() => connectAndSend(getAccessToken()), 5000);
});


  ws.on("error", (err) => {
    console.error("Error en WebSocket:", err.message || err);
  });

  ws.on("message", (data) => {
    console.log("Mensaje recibido del servidor:", data.toString());
  });
}

// export function connectWS(http) {
//   ws = new Server(http, {
//     cors: {
//       origin: "*", // O tu dominio específico
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//     allowEIO3: true,
//     transports: ["polling", "websocket"],
//   });

//   // Configuracion de atributos y decodificacion de datos para socket.
//   ws.use(async (socket, next) => {
//     const token = socket.handshake.auth.token;
//     const userSub = socket.handshake.auth.userSub;
//     // ... resto de la lógica
//     if (!token) {
//       return next(new Error("Authentication error: No token provided"));
//     }

//     try {
//       // Valida token (ej. JWT)
//       const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ajusta a tu secreto
//       socket.user = decoded; // Almacena datos del usuario (ej. sub)
//       socket.token = token;
//       socket.sub = userSub;

//       next();
//     } catch (err) {
//       console.log("err", err);
//       if (err.name === "TokenExpiredError") {
//         // Opcional: Intenta refresh si tienes refreshToken en cookie o DB
//         // Por ejemplo: const refreshed = await refreshToken(socket.handshake.auth.refreshToken);
//         return next(new Error("Token expired"));
//       }
//       next(new Error("Invalid token"));
//     }
//   });

//   ws.on("connection", (socket) => {
//     console.log("Socket.io conectado");

//     // obtengo token de usuario enviada a la conexion
//     const token = socket.token;

//     // Esperamos a que el cliente nos diga su sub para unirlo a su sala
//     socket.on("join", (userData) => {
//       const { sub } = userData;
//       if (!sub) {
//         socket.emit("error", {
//           error: "Falta el identificador de usuario (sub)",
//         });
//         return;
//       }
//       socket.sub = sub; // Guardamos el sub en el socket
//       socket.join(sub);
//       console.log(`✅ User ${sub} joined their own room`);
//     });

//     // Recibimos el mensaje del usuario
//     /* ESTRUCTURA DE DATA
//     {
//       messageText: string,
//       sessionId: string = sub  del usuario
//       queryParams : { sheetId: id de sheet ( plantilla de analitika) }
//     }*/
//     socket.on("user-message", async (data) => {
//       // Obtenemos sub inicializado cuando el usuario se unio, sino usamaos el sessionId
//       const sub = socket.sub || data.sessionId;

//       if (!sub) {
//         socket.emit("error", { error: "Usuario no autenticado en la sala" });
//         return;
//       } else {
//         socket.sub = data.sessionId;
//         socket.join(data.sessionId);
//       }

//       // Extraemos los datos necesarios del mensaje
//       const { messageText, sessionId, queryParams } = data;

//       // * Validacion de parametros necesarios y obligatorios
//       if (!queryParams.sheetId) {
//         io.to(sub).emit(
//           "ai-response",
//           "Falta el identificador de la hoja de cálculo"
//         );
//       }

//       if (!messageText) {
//         io.to(sub).emit(
//           "ai-response",
//           "Debe enviar un mensaje de texto para poder realizar una acción"
//         );
//       }

//       if (!sessionId) {
//         io.to(sub).emit(
//           "ai-response",
//           "Debe enviar un identificador de sesión para poder realizar una acción"
//         );
//       }

//       // Notificar que el bot está escribiendo ( INDICIADOR )
//       io.to(sub).emit("bot-typing-start");

//       // Procesamos el mensaje usando el controlador
//       const response = await chatController.processMessageSocket({
//         messageText,
//         sessionId: sessionId || "default-session",
//         token: token,
//         sub,
//         queryParams: queryParams,
//       });

//       // ✅ Detener el indicador de escritura antes de enviar la respuesta
//       io.to(sub).emit("bot-typing-stop");

//       // Respondemos solo a la sala del usuario
//       io.to(sub).emit("ai-response", response);
//     });

//     // Recuperar historial (opcional)
//     socket.on("get-history", async (data) => {
//       const { sessionId } = data;
//       const sub = socket.sub;
//       if (!sub || !sessionId) {
//         socket.emit("error", { error: "Falta sub o sessionId" });
//         return;
//       }
//       const historyResponse = await chatController.getConversationHistory({
//         sessionId,
//         userId: sub,
//       });
//       socket.emit("history-response", historyResponse);
//     });

//     // Resetear conversación (opcional)
//     socket.on("reset-conversation", async (data) => {
//       const { sessionId } = data;
//       const sub = socket.sub;
//       if (!sub || !sessionId) {
//         socket.emit("error", { error: "Falta sub o sessionId" });
//         return;
//       }
//       const resetResponse = await chatController.resetConversation({
//         sessionId,
//         userId: sub,
//       });
//       socket.emit("reset-response", resetResponse);
//     });

//     // Desconexion de socket
//     socket.on("disconnect", () => {
//       const sub = socket.sub;
//       if (sub) {
//         // Limpiar el token del caché cuando el usuario se desconecta
//         tokenManager.clearUserToken(sub);
//         console.log(
//           `🔌 Socket desconectado - Usuario ${sub} limpiado del caché`
//         );
//       }
//       console.log("Socket.io desconectado");
//     });

//     // Endpoint para debugging (opcional)
//     socket.on("debug-tokens", () => {
//       const sub = socket.sub;
//       if (sub) {
//         const cacheInfo = tokenManager.getCacheInfo();
//         socket.emit("debug-response", {
//           userToken: cacheInfo[sub] || "No encontrado",
//           allCache: cacheInfo,
//         });
//       }
//     });
//   });
// }

// function sendJson() {
//   if (!ws || ws.readyState !== WebSocket.OPEN) return;
//   const payload = {
//     sensor: "temperature",
//     value: Math.round(20 + Math.random() * 10), // ejemplo de dato
//     timestamp: new Date().toISOString(),
//   };
//   ws.send(JSON.stringify(payload));
//   console.log("Enviado:", payload);
// }

// connectWS();
