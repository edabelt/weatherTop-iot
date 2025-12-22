export function codeToIcon(code) {
  const n = Number(code);
  if (n === 800) return { icon: "☀️", label: "Clear sky" };
  if (n >= 801 && n <= 804) return { icon: "☁️", label: "Clouds" };
  if (n >= 200 && n <= 232) return { icon: "⛈️", label: "Thunderstorm" };
  if (n >= 300 && n <= 321) return { icon: "🌧️", label: "Drizzle" };
  if (n >= 500 && n <= 531) return { icon: "🌧️", label: "Rain" };
  if (n >= 600 && n <= 622) return { icon: "❄️", label: "Snow" };
  if (n >= 700 && n <= 781) return { icon: "🌫️", label: "Atmosphere" };
  return { icon: "🌡️", label: "Unknown" };
}
