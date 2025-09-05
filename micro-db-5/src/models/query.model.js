import pool from "../config/db.js";

class QueryModel {
  async getData(queryParts = [], queryValues = [], page = 1, limit = 10) {
    try {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 10);
      const offset = (pageNum - 1) * limitNum;

      // Reemplazamos los ? por $1, $2, ... para PostgreSQL
      const whereClause = queryParts.length
        ? "WHERE " +
          queryParts
            .map((part, i) => part.replace("?", `$${i + 1}`))
            .join(" AND ")
        : "WHERE true";

      // Obtener total de registros
      const countSql = `SELECT COUNT(*) as total FROM data_schema.temperature_measurements ${whereClause}`;
      const countResult = await pool.query(countSql, queryValues);
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limitNum);

      // Query de datos con placeholders correctos
      const baseIndex = queryValues.length;
      const dataSql = `
        SELECT *
        FROM data_schema.temperature_measurements
        ${whereClause}
        ORDER BY captured_at DESC
        LIMIT $${baseIndex + 1} OFFSET $${baseIndex + 2}
      `;
      const finalQueryValues = [...queryValues, limitNum, offset];
      const dataResult = await pool.query(dataSql, finalQueryValues);

      return {
        status: 200,
        data: {
          records: dataResult.rows,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalRecords: total,
            recordsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
            nextPage: pageNum < totalPages ? pageNum + 1 : null,
            prevPage: pageNum > 1 ? pageNum - 1 : null,
          },
        },
      };
    } catch (error) {
      console.error("Error en QueryModel.getData:", error);
      return { status: 500, data: { error: "Error interno del servidor" } };
    }
  }
}

export default new QueryModel();
