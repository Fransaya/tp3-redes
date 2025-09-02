import axios from "axios";
import dotenv from "dotenv";
import { getAccessToken, isAccessTokenNearExpiry, refresh } from "./authManager.js";

dotenv.config(); // Cargar variables de entorno

const MICRO3_URL = process.env.MICRO3_URL; // Leer la URL desde .env
console.log("MICRO3_URL", MICRO3_URL);

export async function forwardToMicro3(payload) {
  try {
    // 1. Verificar expiración
    if (isAccessTokenNearExpiry()) {
      console.log("[Forwarder] Token por expirar, renovando...");
      await refresh();
    }

    // 2. Enviar a Micro 3
    const res = await axios.post(MICRO3_URL, payload, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[Forwarder] ✅ Enviado a Micro 3:", res.status, res.statusText);
    return res.data;

  } catch (error) {
    // 3. Manejo de error
    if (error.response && error.response.status === 401) {
      console.warn("[Forwarder] ⚠️ Token inválido, intentando refresh...");
      await refresh();

      // Reintentar una sola vez
      try {
        const retryRes = await axios.post(MICRO3_URL, payload, {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "Content-Type": "application/json",
          },
        });
        console.log("[Forwarder] ✅ Reintento exitoso:", retryRes.status);
        return retryRes.data;
      } catch (retryError) {
        console.error("[Forwarder] ❌ Reintento falló:", retryError.message);
      }
    } else {
      console.error("[Forwarder] ❌ Error al enviar a Micro 3:", error.message);
    }
  }
}