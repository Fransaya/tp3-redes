import Router from "express";
import queryModel from "../models/query.model.js";

const router = Router();

router.get("/data", async (req, res) => {
  try {
    const { city, country, captured_at, page = 1, limit = 10 } = req.query;
    console.log("req.query", req.query);

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
      queryParts.push("captured_at = ?");
      queryValues.push(parseInt(captured_at, 10));
    }

    // Convertimos page y limit a enteros por si vienen como strings
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const response = await queryModel.getData(
      queryParts,
      queryValues,
      pageNumber,
      limitNumber
    );

    res.status(200).json(response);
  } catch (error) {
    console.error("Error en /query/data:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
