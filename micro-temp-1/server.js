import express from 'express';
import dotenv from 'dotenv';
import temperatureRoutes from './routes/temperatureRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const port = 3000;

// Rutas
app.use('/', temperatureRoutes);
app.use('/', authRoutes);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});