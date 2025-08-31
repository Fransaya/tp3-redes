import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import compression from "compression";
import rateLimit from "express-rate-limit";

// Metodo de autenticacion
import AuthService from "./services/auth.service.js";

// Metodos para almacenmiento de data session (accessToken, refreshToken, expiresIn)
import { saveSession } from "./services/token.service.js";

// controlador de data
import dataController from "./controller/data.controller.js";

dotenv.config();

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
const generalLimiter = createRateLimiter(60 * 1000, 100); // 100 req/1min
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
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

app.use("/api", dataController);

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

const authenticateService = async () => {
  try {
    const authService = new AuthService();
    const session = await authService.login({
      username: process.env.AUTH_USER,
      password: process.env.AUTH_PASSWORD,
    });

    console.log("data to session", session);

    if (session.status == "success") {
      const expireIn = new Date();
      expireIn.setSeconds(expireIn.getSeconds() + session.expiresIn);
      console.log("Session expirará en:", expireIn);
      const accessToken = session.accessToken;
      const refreshToken = session.refreshToken;

      saveSession({ accessToken, refreshToken, expireIn });
    }
  } catch (error) {
    console.log("ERROR EN LOGIN", error);
    console.error("❌ Error de autenticación:", error.message);
  }
};

// Inicialización del servidor
const startServer = async () => {
  try {
    // Autenticación inicial al iniciar
    await authenticateService();
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
