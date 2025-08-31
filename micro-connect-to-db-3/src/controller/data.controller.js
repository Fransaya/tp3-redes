import express from "express";

// Clase para envio de datos a micro de db
import DataService from "../services/data.service.js";

// Metodo para veritifacion de jwt
import { verifyJWT } from "../middleware/verifyJWT.js";

// Metodo para sessiones
import { getSession } from "../services/token.service.js";

// Metodo para validar expiracion de mi token
import { isTokenExpired } from "../utils/isTokenExpired.js";

const router = express.Router();

const dataService = new DataService();

// Definir rutas y controladores aquí
router.post("/dataRecived", verifyJWT, async (req, res, next) => {
  try {
    const data = req.body;
    console.log("data", data);

    if (!data)
      return res.status(400).json({ error: "Faltan datos en la solicitud" });

    if (isTokenExpired()) {
      // Proceso de renovacion de token
    }

    const session = getSession();

    console.log("session", session);

    if (!session)
      return res.status(401).json({ error: "No hay sesión activa" });

    // Envio de datos a micro de db

    const response = await dataService.sendData(data, session.accessToken);

    console.log("response", response);

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
