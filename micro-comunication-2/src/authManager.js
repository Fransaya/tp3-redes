import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Cargar variables de entorno

const AUTH_URL = process.env.AUTH_URL; // Leer AUTH_URL desde .env
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET; // Leer JWT_REFRESH_SECRET desde .env
const CREDENTIALS = {
  username: process.env.AUTH_USERNAME, // Leer USERNAME desde .env
  password: process.env.PASSWORD, // Leer PASSWORD desde .env
};

let tokens = {
  accessToken: null,
  refreshToken: null,
  exp: null,
};

// Login inicial
export async function login() {
  try {
    const res = await axios.post(`${AUTH_URL}/auth/login`, CREDENTIALS);
    const { accessToken, refreshToken, expiresIn } = res.data; //* en el login devuelve el timpo de exp

    // Fecha actual
    const now = new Date();

    // Agregar 3600 segundos (1 hora)
    const segundos = expiresIn;
    const futureDate = new Date(now.getTime() + segundos * 1000); //* sumo al tiempo local el tiempo de exp

    tokens.accessToken = accessToken;
    tokens.refreshToken = refreshToken;
    tokens.exp = futureDate; // * seteo el exp en la fecha actual del server

    console.log("[Auth] Login exitoso");
    console.log("tokens", tokens);
  } catch (error) {
    console.error("[Auth] Error en login:", error.message);
  }
}

// Refresh
export async function refresh() {
  try {
    console.log("[Auth] Intentando renovar el token...");

    // Enviar el refresh token en el encabezado
    const res = await axios.post(
      `${AUTH_URL}/token/refresh`,
      {},
      {
        headers: {
          "refresh-token": tokens.refreshToken, // Encabezado correcto
        },
      }
    );

    // Actualizar el accessToken y su expiración
    tokens.accessToken = res.data.accessToken;

    const decoded = jwt.decode(tokens.accessToken);
    tokens.exp = decoded.exp;

    console.log("[Auth] Token renovado exitosamente");
    console.log("Nuevo accessToken:", tokens.accessToken);
    console.log("Expiración:", tokens.exp);
  } catch (error) {
    console.error("[Auth] Error en refresh:", error.message);
    console.error("[Auth] Detalles del error:", error.response?.data || error);
  }
}

//* refactorizacion
export function isAccessTokenNearExpiry() {
  console.log("token exp", tokens);
  console.log("convert to ms", Math.floor(new Date(tokens.exp) / 1000));
  if (!tokens.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return Math.floor(new Date(tokens.exp) / 1000) - now < 300; // menos de 5 min
}

export function startTokenMonitor() {
  setInterval(async () => {
    if (isAccessTokenNearExpiry()) {
      console.log("[Auth] Token por expirar, renovando...");
      await refresh();
    }
  }, 60000);
}

export function getAccessToken() {
  return tokens.accessToken;
}
