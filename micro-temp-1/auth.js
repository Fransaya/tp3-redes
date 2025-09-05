import dotenv from "dotenv";
dotenv.config();

const LOGIN_URL = process.env.LOGIN_URL;
const USERNAME = process.env.AUTH_USER;
const PASSWORD = process.env.PASSWORD;
const REFRESH_URL = process.env.REFRESH_URL;


import {getRefreshToken, setTokens } from "./utils/tokenManager.js";

/**
 * Hace login y devuelve accessToken, refreshToken y expiresIn
 */
export async function login() {
  try {
    console.log("Enviando login con:", {
      username: USERNAME,
      password: PASSWORD,
    });

    const response = await fetch(`${LOGIN_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: USERNAME,
        password: PASSWORD,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error en login: ${response.status} - ${text}`);
    }

    const data = await response.json();
    const { accessToken, refreshToken, expiresIn } = data;

    console.log("Login exitoso");
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);
    console.log("Expira en (s):", expiresIn);

    //*  this funciton save the tokens in a memory variable
setTokens({ access: accessToken, refresh: refreshToken, expiresIn });

    return { accessToken, refreshToken, expiresIn };
  } catch (error) {
    console.error("Error en login:", error.message);
    throw error;
  }
}

export async function refreshAccessToken() {
  try {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      throw new Error("No hay refresh token disponible");
    }

    console.log("Solicitando nuevo access token con refresh token...");

    const response = await fetch(`${REFRESH_URL}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "refresh-token": currentRefreshToken 
      },
      body: JSON.stringify({}) 
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error en refresh token: ${response.status} - ${text}`);
    }

    const data = await response.json();
      const { accessToken } = data;

    console.log("Refresh token exitoso");
    console.log("Nuevo Access Token:", accessToken);


    // Guardamos los nuevos tokens
    setTokens({ access: accessToken, refresh: currentRefreshToken, expiresIn: 3600});

    return { accessToken};
  } catch (error) {
    console.error("Error en refresh token:", error.message);
    throw error;
  }
}
