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
const port = 3005;

const server = http.createServer(app);

const data = await login();

connectAndSend(data.accessToken);

// Rutas
app.use("/", temperatureRoutes);
app.use("/", authRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
