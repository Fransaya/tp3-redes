export const cities = {
    shanghai: { lat: 31.2304, lon: 121.4737, city: "Shanghai"},
    berlin: { lat: 52.5200, lon: 13.4050, city: "Berlin" },
    rio: { lat: -22.9068, lon: -43.1729, city: "Rio de Janeiro" }
};

export async function getTemperature(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    const data = await response.json();
    return data.current_weather.temperature;
}