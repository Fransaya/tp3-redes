import { WebSocketServer } from "ws";

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws, req) => {
  console.log("Cliente conectado desde", req.socket.remoteAddress);

  ws.on("message", (message) => {
    console.log("Mensaje recibido:", message.toString());
    // Opcional: responder al cliente
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

console.log(`Servidor WebSocket escuchando en ws://localhost:${PORT}`);
