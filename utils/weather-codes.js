export const windDirs = [
  "N","NNE","NE","ENE","E","ESE","SE","SSE",
  "S","SSW","SW","WSW","W","WNW","NW","NNW"
];

export const weatherCodes = [
  {
    group: "Thunderstorm",
    items: [
      { code: 200, label: "Thunderstorm with light rain" },
      { code: 201, label: "Thunderstorm with rain" },
      { code: 202, label: "Thunderstorm with heavy rain" },
      { code: 210, label: "Light thunderstorm" },
      { code: 211, label: "Thunderstorm" },
      { code: 212, label: "Heavy thunderstorm" },
      { code: 221, label: "Ragged thunderstorm" },
      { code: 230, label: "Thunderstorm with light drizzle" },
      { code: 231, label: "Thunderstorm with drizzle" },
      { code: 232, label: "Thunderstorm with heavy drizzle" }
    ]
  },
  {
    group: "Drizzle",
    items: [
      { code: 300, label: "Light intensity drizzle" },
      { code: 301, label: "Drizzle" },
      { code: 302, label: "Heavy intensity drizzle" },
      { code: 310, label: "Light intensity drizzle rain" },
      { code: 311, label: "Drizzle rain" },
      { code: 312, label: "Heavy intensity drizzle rain" },
      { code: 313, label: "Shower rain and drizzle" },
      { code: 314, label: "Heavy shower rain and drizzle" },
      { code: 321, label: "Shower drizzle" }
    ]
  },
  {
    group: "Rain",
    items: [
      { code: 500, label: "Light rain" },
      { code: 501, label: "Moderate rain" },
      { code: 502, label: "Heavy intensity rain" },
      { code: 503, label: "Very heavy rain" },
      { code: 504, label: "Extreme rain" },
      { code: 511, label: "Freezing rain" },
      { code: 520, label: "Light intensity shower rain" },
      { code: 521, label: "Shower rain" },
      { code: 522, label: "Heavy intensity shower rain" },
      { code: 531, label: "Ragged shower rain" }
    ]
  },
  {
    group: "Snow",
    items: [
      { code: 600, label: "Light snow" },
      { code: 601, label: "Snow" },
      { code: 602, label: "Heavy snow" },
      { code: 611, label: "Sleet" },
      { code: 612, label: "Light shower sleet" },
      { code: 613, label: "Shower sleet" },
      { code: 615, label: "Light rain and snow" },
      { code: 616, label: "Rain and snow" },
      { code: 620, label: "Light shower snow" },
      { code: 621, label: "Shower snow" },
      { code: 622, label: "Heavy shower snow" }
    ]
  },
  {
    group: "Atmosphere",
    items: [
      { code: 701, label: "Mist" },
      { code: 711, label: "Smoke" },
      { code: 721, label: "Haze" },
      { code: 731, label: "Sand/dust whirls" },
      { code: 741, label: "Fog" },
      { code: 751, label: "Sand" },
      { code: 761, label: "Dust" },
      { code: 762, label: "Volcanic ash" },
      { code: 771, label: "Squalls" },
      { code: 781, label: "Tornado" }
    ]
  },
  {
    group: "Clear",
    items: [{ code: 800, label: "Clear sky" }]
  },
  {
    group: "Clouds",
    items: [
      { code: 801, label: "Few clouds" },
      { code: 802, label: "Scattered clouds" },
      { code: 803, label: "Broken clouds" },
      { code: 804, label: "Overcast clouds" }
    ]
  }
];
