import Router from "express";

// Funcion de generacion de jwt
import { generateJWT } from "../utils/generateJWT.js";

// Rate limiter
import rateLimit from "express-rate-limit";

// Encriptado de passwords
import bcrypt from "bcrypt";

import pool from "../config/db.js";

const router = Router();

// Cache para prepared statements (mejora performance)
const preparedStatements = {
  getUserByUsername:
    "SELECT id, username, password_hash FROM service_users WHERE username = $1",
  upsertRefreshToken: `
  INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at)
  VALUES ($1, $2, $3, $4, NOW())
  ON CONFLICT (id)
  DO UPDATE SET 
    token = EXCLUDED.token,
    expires_at = EXCLUDED.expires_at
  RETURNING id
`,
};

// Validación de entrada
const validateLoginInput = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username y password son requeridos",
    });
  }

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({
      error: "Username y password deben ser strings",
    });
  }

  if (username.trim().length === 0 || password.length === 0) {
    return res.status(400).json({
      error: "Username y password no pueden estar vacíos",
    });
  }

  if (username.length > 255 || password.length > 255) {
    return res.status(400).json({
      error: "Username y password muy largos",
    });
  }

  next();
};

router.post("/login", validateLoginInput, async (req, res) => {
  const { username, password } = req.body;
  let client;

  try {
    // Obtener conexión del pool
    client = await pool.connect();

    // Usar prepared statement para mejor performance
    const userResult = await client.query(
      preparedStatements.getUserByUsername,
      [username.trim()]
    );

    // Verificar si el usuario existe
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    const user = userResult.rows[0];

    // Verificar la contraseña de forma asíncrona
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    // Generar tokens de forma paralela
    const tokenPayload = { id: user.id, username: user.username };

    const [accessToken, refreshToken] = await Promise.all([
      generateJWT(tokenPayload, "1h"),
      generateJWT(tokenPayload, "7d"),
    ]);

    // Calcular fecha de expiración más eficientemente
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    // Iniciar transacción para garantizar consistencia
    await client.query("BEGIN");

    try {
      // Guardar refresh token usando prepared statement
      await client.query(preparedStatements.upsertRefreshToken, [
        user.id,
        user.id,
        refreshToken,
        expiresAt,
      ]);

      await client.query("COMMIT");

      // Respuesta optimizada sin datos sensibles
      const response = {
        status: "success",
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
        },
        expiresIn: 3600, // 1 hora en segundos
        tokenType: "Bearer",
      };

      // Headers de seguridad adicionales
      res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        Pragma: "no-cache",
        "X-Content-Type-Options": "nosniff",
      });

      return res.status(200).json(response);
    } catch (dbError) {
      await client.query("ROLLBACK");
      throw dbError;
    }
  } catch (error) {
    // Log detallado para debugging pero respuesta genérica
    console.error("Error en /login:", {
      error: error.message,
      stack: error.stack,
      username,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Respuesta genérica para no exponer información sensible
    return res.status(500).json({
      error: "Error interno del servidor",
      requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
  } finally {
    // Siempre liberar la conexión
    if (client) {
      client.release();
    }
  }
});

export default router;
