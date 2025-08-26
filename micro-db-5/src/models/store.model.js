import pool from "../config/db.js";

class StoreModel {
  constructor() {
    this.db = pool.connect();
  }

  async save(city, temperature, timestampt, capturedAt, source, traceId) {
    try {
      const query = `
        INSERT INTO data_schema.temperature_measurements (city, temperature, timestamp , capturedAt, source, traceId)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      const values = [
        city,
        temperature,
        timestampt,
        capturedAt,
        source,
        traceId,
      ];
      await this.db.query(query, values);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new StoreModel();
