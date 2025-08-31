import { Router } from "express";

import storeModel from "../models/store.model.js";

// Ruta para guardado de data
const router = Router();

/**
 * {
"source": "ws-capture-1",
"city": "Buenos Aires",
"country": "AR",
"value_c": 23.5,
"captured_at": "2025-08-26T11:22:33.123Z",
"trace_id": "2f5c1b52-5e5e-4a1e-8f1a-99d5b5ce0a00"
}
 */
router.post("/capture", async (req, res) => {
  const body = req.body;

  try {
    console.log("body", req.body);
    // Validacion de campos obligatorios
    if (
      !body.source ||
      !body.city ||
      !body.value_c ||
      !body.captured_at ||
      !body.trace_id
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const sourceAccept = process.env.SOURCE_ACEPT;

    if (body.source !== sourceAccept) {
      return res.status(403).json({ error: "Fuente no autorizada" });
    }

    // Convierto la fecha a timestamp

    const capturedAtDate = new Date(body.captured_at);

    const resultSave = await storeModel.save(
      body.city,
      body.value_c,
      capturedAtDate,
      body.source,
      body.trace_id
    );

    if (!resultSave.success) {
      return res.status(500).json({ error: "Error al guardar los datos" });
    }

    return res.status(201).json({ message: "Datos guardados correctamente" });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
