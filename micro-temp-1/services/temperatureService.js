import axios from "axios";

export const cities = {
  shanghai: { lat: 31.2304, lon: 121.4737, city: "Shanghai" },
  berlin: { lat: 52.52, lon: 13.405, city: "Berlin" },
  rio: { lat: -22.9068, lon: -43.1729, city: "Rio de Janeiro" },
};

// export async function getTemperature(lat, lon) {
//   const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
//   const response = await fetch(url);
//   console.log("response", response);
//   const data = await response.json();
//   return data.current_weather.temperature;
// }

// export async function getTemperature(lat, lon) {
//   const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 30000);

//   const response = await fetch(url, {
//     signal: controller.signal,
//   });

//   clearTimeout(timeoutId);

//   console.log("response", response);
//   const data = await response.json();
//   return data.current_weather.temperature;
// }

// export async function getTemperature(lat, lon) {
//   const url = "https://api.open-meteo.com/v1/forecast";
//   const response = await axios.get(url, {
//     params: {
//       latitude: lat,
//       longitude: lon,
//       current_weather: true,
//     },
//     timeout: 50000, // 10 segundos timeout
//   });

//   console.log("getTemperature", response);

//   // la API devuelve así: response.data.current_weather.temperature
//   return response.data.current_weather.temperature;
// }

// Reemplaza 'YOUR_API_KEY' con tu API key de weatherapi.com
const API_KEY = "07a2e77ad9cb4764b0f15432250209";

export async function getTemperature(lat, lon) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  const response = await fetch(url, {
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  console.log("response", response);
  const data = await response.json();

  // WeatherAPI devuelve la temperatura en data.current.temp_c
  return data.current.temp_c;
}
