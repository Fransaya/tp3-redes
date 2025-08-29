import axios from "axios";
import jwt from "jsonwebtoken";

const AUTH_URL = "https://tp3-redes.onrender.com/auth";
const CREDENTIALS = { username: "ws_forwarding_service", password: "m1croS3ervice.ws$" };

let tokens = {
  accessToken: null,
  refreshToken: null,
  exp: null,
};

// Login inicial
export async function login() {
  try {
    const res = await axios.post(`${AUTH_URL}/login`, CREDENTIALS);
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
    const res = await axios.post(`${AUTH_URL}/token/refresh`, {
      refreshToken: tokens.refreshToken,
    });

    tokens.accessToken = res.data.accessToken;

    const decoded = jwt.decode(tokens.accessToken);
    tokens.exp = decoded.exp;

    console.log("[Auth] Token renovado");
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
