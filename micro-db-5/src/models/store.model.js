import pool from "../config/db.js";

class StoreModel {
  constructor() {
    this.db = pool.connect();
  }

  async save(city, temperature, capturedAt, source, traceId) {
    try {
      const query = `
        INSERT INTO data_schema.temperature_measurements (source, city, temperature, captured_at, trace_id)
          VALUES ($1, $2, $3, $4, $5)
      `;
      const values = [source, city, temperature, capturedAt, traceId];
      await pool.query(query, values);

      return { success: true };
    } catch (error) {
      console.log("error", error);
      return { success: false, error: error.message };
    }
  }
}

export default new StoreModel();
