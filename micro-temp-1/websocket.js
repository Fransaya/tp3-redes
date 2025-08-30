import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

const WS_URL = process.env.WS_URL || 'ws://localhost:3001';
const TOKEN = process.env.BEARER_TOKEN || 'TU_BEARER_TOKEN';
const INTERVAL_MS = Number(process.env.SEND_INTERVAL_MS) || 5000;

let ws;
let sendInterval;

export function connectWS() {
  ws = new WebSocket(WS_URL, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  ws.on('open', () => {
    console.log('WebSocket conectado a', WS_URL);
    sendJson(); // enviar inmediatamente
    if (sendInterval) clearInterval(sendInterval);
    sendInterval = setInterval(sendJson, INTERVAL_MS);
  });

  ws.on('message', (data) => {
    console.log('Mensaje recibido:', data.toString());
  });

  ws.on('close', (code, reason) => {
    console.log('WebSocket cerrado', code, reason?.toString());
    if (sendInterval) { clearInterval(sendInterval); sendInterval = null; }
    // reconectar en 2s
    setTimeout(connectWS, 2000);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err?.message || err);
    // cerrar para desencadenar reconexión
    try { ws.close(); } catch (e) {}
  });
}

function sendJson() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  const payload = {
    sensor: 'temperature',
    value: Math.round(20 + Math.random() * 10), // ejemplo de dato
    timestamp: new Date().toISOString()
  };
  ws.send(JSON.stringify(payload));
  console.log('Enviado:', payload);
}

connectWS();