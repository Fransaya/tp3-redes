import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Cargar variables de entorno

const AUTH_URL = process.env.AUTH_URL; // Leer AUTH_URL desde .env
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET; // Leer JWT_REFRESH_SECRET desde .env
const CREDENTIALS = { 
  username: process.env.AUTH_USERNAME, // Leer USERNAME desde .env
  password: process.env.PASSWORD  // Leer PASSWORD desde .env
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
    const { accessToken, refreshToken } = res.data;

    tokens.accessToken = accessToken;
    tokens.refreshToken = refreshToken;

    const decoded = jwt.decode(accessToken);
    tokens.exp = decoded.exp;

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
    const res = await axios.post(`${AUTH_URL}/token/refresh`, {
      refreshToken: tokens.refreshToken,
    });

    tokens.accessToken = res.data.accessToken;

    const decoded = jwt.decode(tokens.accessToken);
    tokens.exp = decoded.exp;

    console.log("[Auth] Token renovado exitosamente");
    console.log("Nuevo accessToken:", tokens.accessToken);
    console.log("Expiración:", tokens.exp);
  } catch (error) {
    console.error("[Auth] Error en refresh:", error.message);
  }
}

export function isAccessTokenNearExpiry() {
  if (!tokens.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return tokens.exp - now < 300; // menos de 5 min
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
