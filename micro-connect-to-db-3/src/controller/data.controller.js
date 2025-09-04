import express from "express";

// Clase para envio de datos a micro de db
import DataService from "../services/data.service.js";

// Metodo para veritifacion de jwt
import { verifyJWT } from "../middleware/verifyJWT.js";

// Metodo para sessiones
import { getSession } from "../services/token.service.js";

// Metodo para validar expiracion de mi token
import { isTokenExpired } from "../utils/isTokenExpired.js";

// Metodo para relogueo de user
import { authenticateService } from "../server.js";

const router = express.Router();

const dataService = new DataService();

// Definir rutas y controladores aquí
router.post("/dataRecived", verifyJWT, async (req, res, next) => {
  try {
    const data = req.body;
    let session = getSession();

    if (!data)
      return res.status(400).json({ error: "Faltan datos en la solicitud" });

    if (isTokenExpired()) {
      // Proceso de renovacion de token
      const sessionReniew = await authenticateService();
      session = sessionReniew;
    }

    if (!session) {
      // Hacemos un relogin
      await authenticateService();

      // Obtenemos la nueva session re-autenticada
      const newSession = getSession();

      if (!newSession)
        return res.status(401).json({ error: "No hay sesión activa" });

      session = newSession;
    }

    // Envio de datos a micro de db

    const response = await dataService.sendData(data, session.accessToken);

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
