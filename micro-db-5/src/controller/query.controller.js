import Router from "express";

import queryModel from "../models/query.model.js";

const router = Router();

router.get("/data", async (req, res) => {
  try {
    const { city, country, captured_at } = req.query;

    const queryParts = [];
    const queryValues = [];

    if (city) {
      queryParts.push("city = ?");
      queryValues.push(city);
    }
    if (country) {
      queryParts.push("country = ?");
      queryValues.push(country);
    }
    if (captured_at) {
      // timestamp
      queryParts.push("captured_at = ?");
      queryValues.push(parseInt(captured_at, 10));
    }

    const response = await queryModel.getData(queryParts, queryValues);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error en /query:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
