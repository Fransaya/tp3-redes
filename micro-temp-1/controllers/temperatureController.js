import { v4 as uuidv4 } from "uuid";
import { cities, getTemperature } from "../services/temperatureService.js";

export const getTemperatures = async (req, res) => {
  try {
    const results = [];

    for (const key of Object.keys(cities)) {
      const { lat, lon, city } = cities[key];
      const temperature = await getTemperature(lat, lon);
      const timestamp = Date.now();
      results.push({
        source: "ws-capture-1",
        city,
        temperature,
        captured_at: timestamp,
        trace_id: uuidv4(),
      });
    }

    res.json(results);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ error: "No se pudo obtener la temperatura" });
  }
};

export const getTemperatureRefactoring = async () => {
  try {
    const results = [];

    for (const key of Object.keys(cities)) {
      const { lat, lon, city } = cities[key];
      const temperature = await getTemperature(lat, lon);
      const timestamp = Date.now();
      results.push({
        source: "ws-capture-1",
        city,
        temperature,
        captured_at: timestamp,
        trace_id: uuidv4(),
      });
    }

    return results;
  } catch (error) {
    console.error("error", error);
    return null;
  }
};
