import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import http from "http";
import https from "https";

const httpAgent = new http.Agent({ family: 4 });
const httpsAgent = new https.Agent({ family: 4 });

export const cities = {
  shanghai: { lat: 31.2304, lon: 121.4737, city: "Shanghai" },
  berlin: { lat: 52.52, lon: 13.405, city: "Berlin" },
  rio: { lat: -22.9068, lon: -43.1729, city: "Rio de Janeiro" },
};

// export async function getTemperature(lat, lon) {
//   try {
//     const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
//     const response = await fetch(url);
//     const data = await response.json();
//     console.log("data get temperatures", data);
//     return data.current_weather.temperature;
//   } catch (error) {
//     console.log("X Error to get temperature", error);
//   }
// }

export async function getTemperature(lat, lon, timeoutSeconds = 10) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  try {
    const response = await axios.get(url, {
      timeout: timeoutSeconds * 1000,
      httpAgent,
      httpsAgent,
    });

    const data = response.data;

    return data.current_weather.temperature;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.log(`X Error: request aborted after ${timeoutSeconds} seconds`);
    } else {
      console.log("X Error to get temperature", error.message || error);
    }
  }
}

export async function getTemperaturesFunction() {
  try {
    const results = [];

    for (const key of Object.keys(cities)) {
      const { lat, lon, city } = cities[key];
      const temperature = await getTemperature(lat, lon);
      const timestamp = Date.now();
      results.push({
        source: "ws-capture-1",
        city,
        temperature,
        captured_at: timestamp,
        trace_id: uuidv4(),
      });
    }

    return results;
  } catch (error) {
    console.error(error);
    return null;
  }
}
