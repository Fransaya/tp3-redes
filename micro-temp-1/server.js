import express from "express";
import dotenv from "dotenv";
import temperatureRoutes from "./routes/temperatureRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { login , refreshAccessToken} from "./auth.js";
import { getAccessToken, getRefreshToken, isTokenExpired } from "./utils/tokenManager.js";


import http from "http";

dotenv.config();

// Funcion de conexion de ws
import { connectAndSend } from "./websocket.js";

const app = express();
const port = 3005;

const server = http.createServer(app);

const data = await login();
console.log(getRefreshToken())

// connectAndSend(data.accessToken);

setInterval(async () => {
  if (isTokenExpired()) {
    console.log("\n⏳ Token próximo a expirar, refrescando...");
    const refreshed = await refreshAccessToken();
    // connectAndSend(refreshed.accessToken);
  }
}, 5000); 
// Rutas
app.use("/", temperatureRoutes);
app.use("/", authRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
