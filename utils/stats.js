export function computeStats(reports = []) {
  const nums = (key) =>
    reports
      .map((r) => Number(r?.[key]))
      .filter((v) => Number.isFinite(v));

  const min = (arr) => (arr.length ? Math.min(...arr) : null);
  const max = (arr) => (arr.length ? Math.max(...arr) : null);

  const temps = nums("temp");
  const winds = nums("windSpeed");
  const press = nums("pressure");

  return {
    minTemp: min(temps),
    maxTemp: max(temps),
    minWind: min(winds),
    maxWind: max(winds),
    minPressure: min(press),
    maxPressure: max(press),
  };
}
