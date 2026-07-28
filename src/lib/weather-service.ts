// Weather service types and helpers

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  rain: number;
  wind: number;
  condition: string;
  icon: string;
  feelsLike: number;
  uvIndex: number;
}

export interface WeatherForecast {
  day: string;
  date: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  rain: number;
  wind: number;
  condition: string;
  icon: string;
  description: string;
}

export interface WeatherAdvisory {
  type: "info" | "warning" | "danger";
  message: string;
}

export interface WeatherData {
  current: WeatherCurrent;
  forecast: WeatherForecast[];
  advisory: WeatherAdvisory;
  location: {
    lat: number;
    lon: number;
    timezone: string;
  };
}

// Mock weather data as fallback
export const mockWeatherData: WeatherData = {
  current: {
    temperature: 22,
    humidity: 65,
    rain: 30,
    wind: 12,
    condition: "Partly Cloudy",
    icon: "02d",
    feelsLike: 20,
    uvIndex: 5,
  },
  forecast: [
    { day: "Mon", date: "2024-03-18", temp: 23, tempMin: 18, tempMax: 26, humidity: 60, rain: 20, wind: 10, condition: "Sunny", icon: "01d", description: "clear sky" },
    { day: "Tue", date: "2024-03-19", temp: 20, tempMin: 16, tempMax: 23, humidity: 70, rain: 60, wind: 15, condition: "Rainy", icon: "10d", description: "light rain" },
    { day: "Wed", date: "2024-03-20", temp: 18, tempMin: 14, tempMax: 21, humidity: 75, rain: 80, wind: 20, condition: "Stormy", icon: "11d", description: "thunderstorm" },
    { day: "Thu", date: "2024-03-21", temp: 21, tempMin: 17, tempMax: 24, humidity: 55, rain: 10, wind: 8, condition: "Sunny", icon: "01d", description: "clear sky" },
    { day: "Fri", date: "2024-03-22", temp: 24, tempMin: 19, tempMax: 27, humidity: 50, rain: 5, wind: 6, condition: "Sunny", icon: "01d", description: "clear sky" },
    { day: "Sat", date: "2024-03-23", temp: 22, tempMin: 17, tempMax: 25, humidity: 65, rain: 40, wind: 12, condition: "Cloudy", icon: "04d", description: "overcast clouds" },
    { day: "Sun", date: "2024-03-24", temp: 19, tempMin: 15, tempMax: 22, humidity: 70, rain: 50, wind: 14, condition: "Rainy", icon: "10d", description: "moderate rain" },
  ],
  advisory: {
    type: "info",
    message: "🌤️ Favorable weather conditions. Continue regular farm operations. Monitor for any sudden changes.",
  },
  location: {
    lat: 40.7128,
    lon: -74.006,
    timezone: "America/New_York",
  },
};

let cachedWeather: WeatherData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch weather data from our API route (which proxies OpenWeatherMap)
 * Falls back to mock data if the API is unavailable
 */
export async function fetchWeatherData(
  lat?: number,
  lon?: number
): Promise<{ data: WeatherData; isLive: boolean }> {
  // Check cache
  const now = Date.now();
  if (cachedWeather && now - lastFetchTime < CACHE_DURATION) {
    return { data: cachedWeather, isLive: true };
  }

  try {
    const params = new URLSearchParams();
    if (lat) params.set("lat", lat.toString());
    if (lon) params.set("lon", lon.toString());

    const response = await fetch(`/api/weather?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("Weather API returned error, using mock data:", response.statusText);
      return { data: mockWeatherData, isLive: false };
    }

    const data: WeatherData = await response.json();

    // Update cache
    cachedWeather = data;
    lastFetchTime = now;

    return { data, isLive: true };
  } catch (error) {
    console.warn("Failed to fetch weather data, using mock data:", error);
    return { data: mockWeatherData, isLive: false };
  }
}

/**
 * Get weather icon URL from OpenWeatherMap
 */
export function getWeatherIconUrl(icon: string, size: "2x" | "4x" = "2x"): string {
  return `https://openweathermap.org/img/wn/${icon}@${size}.png`;
}

/**
 * Get a color for the temperature gauge
 */
export function getTemperatureColor(temp: number): string {
  if (temp >= 35) return "from-red-500 to-orange-500";
  if (temp >= 30) return "from-orange-400 to-yellow-500";
  if (temp >= 25) return "from-yellow-400 to-amber-500";
  if (temp >= 20) return "from-green-400 to-emerald-500";
  if (temp >= 15) return "from-blue-400 to-cyan-500";
  if (temp >= 10) return "from-blue-500 to-indigo-500";
  if (temp >= 0) return "from-indigo-400 to-purple-500";
  return "from-purple-500 to-pink-500";
}

/**
 * Get a descriptive label for the UV index
 */
export function getUVLabel(uvi: number): string {
  if (uvi <= 2) return "Low";
  if (uvi <= 5) return "Moderate";
  if (uvi <= 7) return "High";
  if (uvi <= 10) return "Very High";
  return "Extreme";
}

/**
 * Get wind direction from degrees
 */
export function getWindDirection(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

