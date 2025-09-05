import express from "express";
import dotenv from "dotenv";
import http from "http";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";

dotenv.config(); // Cargar variables de entorno primero

// Ahora importamos la configuración de la DB
import pool from "./config/db.js";

// Ruta de controlado de auth
import authRouter from "./controller/auth.controller.js";
import swaggerDocsRouter from "./swaggerDocs.js";

// Ruta de controlado de token
import tokenRouter from "./controller/token.controller.js";

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Compresión GZIP
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
    threshold: 1024, // Solo comprimir si es > 1KB
    level: 6, // Balance entre velocidad y ratio de compresión
  })
);

// Configuración de CORS
app.use(
  cors({
    origin: "*", // tu frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware para parsing JSON optimizado
app.use(
  express.json({
    limit: "10mb",
    type: ["application/json", "text/plain"],
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

app.use("/auth", authRouter);
app.use("/token", tokenRouter);
app.use(swaggerDocsRouter);
// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware de manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error(`Error ${err.status || 500}: ${err.message}`, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // No exponer detalles del error en producción
  const message =
    NODE_ENV === "production" ? "Error interno del servidor" : err.message;

  res.status(err.status || 500).json({
    error: message,
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
});

const server = http.createServer(app);

// Inicialización del servidor
const startServer = async () => {
  try {
    // Probar conexión a DB
    const client = await pool.connect();
    console.log("✅ Conexión exitosa a la base de datos");
    client.release();

    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`🚀 HTTP Server running on port ${PORT} (${NODE_ENV})`);
      console.log(`📊 Process ID: ${process.pid}`);
      console.log(
        `💾 Memory usage: ${Math.round(
          process.memoryUsage().heapUsed / 1024 / 1024
        )} MB`
      );
    });
  } catch (error) {
    console.error("❌ Error al inicializar servidor:", error.stack);
    process.exit(1);
  }
};

startServer();

export default app;
