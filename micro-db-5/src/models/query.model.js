import pool from "../config/db.js";

class QueryModel {
  constructor() {
    this.db = pool.connect();
  }

  getData(queryParts, queryValues) {
    try {
      const whereClause = queryParts.length
        ? "WHERE " + queryParts.join(" AND ")
        : "";
      const sql = `SELECT * FROM data_schema.temperature_measurements ${whereClause} ORDER BY captured_at DESC LIMIT 100`;

      const response = new Promise((resolve, reject) => {
        pool.query(sql, queryValues, (err, results) => {
          if (err) {
            console.error("Error en consulta SQL:", err);
            return reject({
              status: 500,
              data: { error: "Error interno del servidor" },
            });
          }
          resolve({ status: 200, data: results });
        });
      });

      return response;
    } catch (error) {
      console.error("Error en QueryModel.getData:", error);
      return { status: 500, data: { error: "Error interno del servidor" } };
    }
  }
}

export default new QueryModel();
