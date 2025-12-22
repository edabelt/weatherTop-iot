import axios from "axios";

export async function geocodeCity(city, country = "", limit = 1) {
  if (!process.env.OWM_API_KEY) throw new Error("OWM_API_KEY not set");
  const q = country ? `${city},${country}` : city;
  const { data } = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
    params: { q, limit, appid: process.env.OWM_API_KEY },
  });
  return (data || []).map((r) => ({
    name: r.name,
    country: r.country || "",
    lat: r.lat,
    lng: r.lon,
    state: r.state || "",
  }));
}
