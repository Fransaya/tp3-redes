import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || "postgres.tytsnugaxecndyhpfwjq",
  host: process.env.DB_HOST || "aws-1-us-east-2.pooler.supabase.com",
  database: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "CompualLimit",
  port: process.env.DB_PORT || 6543,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxUses: 7500,
  allowExitOnIdle: true,
};

const pool = new Pool(dbConfig);

pool.on("error", (err, client) => {
  console.error("Error inesperado en cliente inactivo", err);
  process.exit(-1);
});

pool.on("connect", () => {
  console.log("Nueva conexión establecida");
});

export default pool;
