import { Router } from "express";

import pool from "../config/db.js";

import { generateJWT } from "../utils/generateJWT.js";

// Middleware para validar el refresh token
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";

const router = Router();

router.post("/refresh", jwtMiddleware, async (req, res) => {
  try {
    // Obtengo el refresh token del request (lo setea el middleware)
    const token = req.refreshToken;
    // Obtengo user decodificado del middleware
    const user = req.user;

    // Valido si obtuvo el token
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Valido si obtuvo el usuario
    if (!user) {
      return res.status(401).json({ error: "Invalid token user" });
    }

    // Consulto el refreshToken en la base de datos
    const query = "SELECT * FROM refresh_tokens WHERE token = $1";
    const values = [token];

    const result = await pool.query(query, values);

    // Verifico si el token existe
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Genero un nuevo token de acceso
    const newToken = generateJWT(
      { id: user.id, username: user.username },
      "1h"
    );

    const response = {
      status: "success",
      accessToken: newToken,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error al procesar el token:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
