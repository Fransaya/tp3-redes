import express from "express";
import dotenv from "dotenv";
import temperatureRoutes from "./routes/temperatureRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import http from "http";

dotenv.config();

// Funcion de conexion de ws
import { connectAndSend } from "./websocket.js";

const app = express();
const port = 3000;

const server = http.createServer(app);

connectAndSend();

// Rutas
app.use("/", temperatureRoutes);
app.use("/", authRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
