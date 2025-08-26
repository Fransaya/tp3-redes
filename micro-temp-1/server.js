import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3000;


//?                                          TEMPERATURAS

//                                     Coordenadas de las ciudades
const cities = {
    shanghai: { lat: 31.2304, lon: 121.4737, city: "Shanghai"},
    berlin: { lat: 52.5200, lon: 13.4050, city: "Berlin" },
    rio: { lat: -22.9068, lon: -43.1729, city: "Rio de Janeiro" }
};

//                                  Función para obtener temperatura
async function getTemperature(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    const data = await response.json();
    return data.current_weather.temperature;
}

//                                          PETICION GET
app.get('/temperaturas', async (req, res) => {
    try {
        const results = [];

        for (const key of Object.keys(cities)) {
            const { lat, lon, city, country } = cities[key];
            const temperature = await getTemperature(lat, lon);

            results.push({
                source: "ws-capture-1",
                city,
                temperature,
                captured_at: new Date().toISOString(),
                trace_id: uuidv4()
            });
        }

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'No se pudo obtener la temperatura' });
    }
});



//?                                         OBTENGO TOKENS

import dotenv from 'dotenv';
import { login } from './auth.js';

dotenv.config();


let tokens = null;

app.get('/get-tokens', async (req, res) => {
    try {
        tokens = await login();
        res.json(tokens);
    } catch (error) {
        res.status(401).json({ error: 'No se pudo hacer login', message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

