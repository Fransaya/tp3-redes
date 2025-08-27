import express from "express";
import dotenv from "dotenv";
import http from "http";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";

// Funcion para consulta de tockens
import { loginMicroService } from "./utils/auth.js";

dotenv.config(); // Cargar variables de entorno primero

// Ahora importamos la configuración de la DB
import pool from "./config/db.js";

// Ruta de controlado de guardado de info
import storeRouter from "./controller/store.controller.js";
import queryRouter from "./controller/query.controller.js";
import swaggerDocsRouter from "./swaggerDocs.js";

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Dile a Express que confíe en el proxy
app.set("trust proxy", 1);

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
    origin: false,
    credentials: true,
  })
);

// Rate limiter
const createRateLimiter = (windowMs, max, skipSuccessfulRequests = false) =>
  rateLimit({
    windowMs,
    max,
    message: { error: "Demasiadas solicitudes, inténtalo más tarde." },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      res.status(429).json({
        error: "Demasiadas solicitudes desde esta IP",
        retryAfter: Math.round(windowMs / 1000),
      });
    },
  });

// Rate limiter general
const generalLimiter = createRateLimiter(15 * 60 * 1000, 200); // 200 req/15min
app.use(generalLimiter);

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
app.get("/status", (req, res) => {
  res.status(200).json({
    status: "process active",
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

// Rutas de la API
app.use("/store", storeRouter);
app.use("/query", queryRouter);

app.use(swaggerDocsRouter);
// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Llamado de funcion de login para guadado de credenciales
loginMicroService();

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

// Optimizaciones del servidor
server.keepAliveTimeout = 65000; // Nginx default + 5s
server.headersTimeout = 66000; // keepAliveTimeout + 1s
server.timeout = 120000; // 2 minutos
server.maxHeadersCount = 2000;

// Manejo elegante de shutdown
const gracefulShutdown = (signal) => {
  console.log(`Recibido ${signal}, cerrando servidor graciosamente...`);

  server.close(async () => {
    console.log("Servidor HTTP cerrado");

    try {
      await pool.end();
      console.log("Conexiones de DB cerradas");
      process.exit(0);
    } catch (error) {
      console.error("Error cerrando conexiones DB:", error);
      process.exit(1);
    }
  });

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error("Forzando cierre del servidor");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Manejo de errores no capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection en:", promise, "razón:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

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
