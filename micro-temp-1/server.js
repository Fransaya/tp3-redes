import express from "express";
import dotenv from "dotenv";
import temperatureRoutes from "./routes/temperatureRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { login } from "./auth.js";

import http from "http";

dotenv.config();

// Funcion de conexion de ws
import { connectAndSend } from "./websocket.js";

const app = express();
const port = 3002;

const server = http.createServer(app);

const session = await login();

// Fecha actual
const now = new Date();

// Agregar 3600 segundos (1 hora)
const segundos = session.expiresIn;
const futureDate = new Date(now.getTime() + segundos * 1000);

console.log("Dentro de 1 hora:", futureDate);

connectAndSend(session.accessToken, session.refreshToken, futureDate);

// Rutas
app.use("/", temperatureRoutes);
app.use("/", authRoutes);

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
