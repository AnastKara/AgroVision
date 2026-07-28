// AgroMonitoring API Service (https://home.agromonitoring.com/)
// Provides agriculture-specific weather and satellite data

const AGRO_API_BASE = "https://api.agromonitoring.com/agro/1.0";

// ============================================================
// Types for AgroMonitoring API responses
// ============================================================

export interface AMWeatherCurrent {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  rain?: { "1h": number };
  snow?: { "1h": number };
  weather: { id: number; main: string; description: string; icon: string }[];
}

export interface AMWeatherDaily {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: { day: number; night: number; eve: number; morn: number };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: { id: number; main: string; description: string; icon: string }[];
  clouds: number;
  pop: number;
  rain?: number;
  uvi: number;
}

export interface AMWeatherResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: AMWeatherCurrent;
  daily: AMWeatherDaily[];
}

export interface WeatherForecastItem {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: { day: number; night: number; eve: number; morn: number };
  pressure: number;
  humidity: number;
  weather: { id: number; main: string; description: string; icon: string }[];
  speed: number;
  deg: number;
  gust: number;
  clouds: number;
  pop: number;
  rain?: number;
}

export interface AMWeatherForecastResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: AMWeatherCurrent;
  hourly: WeatherForecastItem[];
}

// Soil data types
export interface AMSoilMoisture {
  dt: number;
  soil_moisture: number;
  soil_moisture_10: number;    // 10cm depth
  soil_moisture_20: number;    // 20cm depth
  soil_moisture_40: number;    // 40cm depth
  soil_moisture_60: number;    // 60cm depth
  soil_moisture_100: number;   // 100cm depth
  surface_temp: number;
}

export interface AMSoilResponse {
  lat: number;
  lon: number;
  timezone: string;
  data: AMSoilMoisture[];
}

export interface AMSoilHistoryItem {
  dt: number;
  soil_moisture: number;
  soil_moisture_10: number;
  soil_moisture_20: number;
  soil_moisture_40: number;
  soil_moisture_60: number;
  soil_moisture_100: number;
  surface_temp: number;
}

// Satellite image data
export interface AMImageSearchResult {
  id: string;
  dt: number;
  type: string;
  cloud_coverage: number;
  sun_azimuth: number;
  sun_elevation: number;
  visible: boolean;
}

export interface AMImageStats {
  type: string;
  source: string;
  ndvi?: {
    min: number;
    max: number;
    mean: number;
    std: number;
    median: number;
    sum: number;
  };
  evi?: {
    min: number;
    max: number;
    mean: number;
    std: number;
    median: number;
    sum: number;
  };
  ndmi?: {
    min: number;
    max: number;
    mean: number;
    std: number;
    median: number;
    sum: number;
  };
  false_color_url?: string;
  true_color_url?: string;
  ndvi_url?: string;
  evi_url?: string;
  ndmi_url?: string;
}

// ============================================================
// Helper functions
// ============================================================

function getApiKey(): string {
  const key = process.env.AGROMONITORING_API_KEY;
  if (!key) {
    throw new Error("AGROMONITORING_API_KEY not configured");
  }
  return key;
}

async function fetchFromAgro<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const apiKey = getApiKey();
  const searchParams = new URLSearchParams({ ...params, appid: apiKey });
  const url = `${AGRO_API_BASE}${endpoint}?${searchParams.toString()}`;

  const response = await fetch(url, { next: { revalidate: 600 } }); // 10 min cache

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AgroMonitoring API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// ============================================================
// AgroMonitoring API Methods
// ============================================================

/**
 * Fetch current weather + 7-day forecast from AgroMonitoring
 */
export async function getWeather(
  lat: string,
  lon: string
): Promise<AMWeatherResponse> {
  return fetchFromAgro<AMWeatherResponse>("/weather", { lat, lon });
}

/**
 * Fetch 8-day weather forecast (hourly granularity)
 */
export async function getWeatherForecast(
  lat: string,
  lon: string
): Promise<AMWeatherForecastResponse> {
  return fetchFromAgro<AMWeatherForecastResponse>("/weather/forecast", { lat, lon });
}

/**
 * Fetch current soil moisture data
 */
export async function getSoilMoisture(
  lat: string,
  lon: string
): Promise<AMSoilResponse> {
  return fetchFromAgro<AMSoilResponse>("/soil", { lat, lon });
}

/**
 * Fetch historical soil moisture
 */
export async function getSoilHistory(
  lat: string,
  lon: string,
  start: number,
  end: number
): Promise<{ data: AMSoilHistoryItem[] }> {
  return fetchFromAgro<{ data: AMSoilHistoryItem[] }>("/soil/history", {
    lat,
    lon,
    start: start.toString(),
    end: end.toString(),
  });
}

/**
 * Search for satellite images in a date range
 */
export async function searchSatelliteImages(
  lat: string,
  lon: string,
  start: number,
  end: number
): Promise<AMImageSearchResult[]> {
  return fetchFromAgro<AMImageSearchResult[]>("/image/search", {
    start: start.toString(),
    end: end.toString(),
    lat,
    lon,
  });
}

/**
 * Get NDVI/EVI stats for a satellite image
 */
export async function getImageStats(
  imageId: string
): Promise<AMImageStats> {
  return fetchFromAgro<AMImageStats>(`/image/${imageId}/stats`, {});
}

// ============================================================
// Domain-specific data transformation
// ============================================================

/**
 * Determine weather condition string from OWM weather ID
 */
export function getAMCondition(id: number): string {
  if (id >= 200 && id < 300) return "Stormy";
  if (id >= 300 && id < 400) return "Rainy";
  if (id >= 500 && id < 600) return "Rainy";
  if (id >= 600 && id < 700) return "Snowy";
  if (id >= 700 && id < 800) return "Foggy";
  if (id === 800) return "Sunny";
  if (id === 801) return "Partly Cloudy";
  if (id >= 802 && id < 900) return "Cloudy";
  return "Unknown";
}

/**
 * Generate crop advisory based on weather conditions
 */
export function getAMCropAdvisory(weather: {
  condition: string;
  temp: number;
  humidity: number;
  rain: number;
  wind: number;
  soilMoisture?: number;
}): { type: "info" | "warning" | "danger"; message: string } {
  const { condition, temp, humidity, rain, wind, soilMoisture } = weather;

  // Check for severe weather first
  if (condition === "Stormy" || (rain > 70 && wind > 30)) {
    return {
      type: "danger",
      message:
        "⚠️ Severe weather expected. Secure equipment and structures. Avoid field work. Consider delaying irrigation.",
    };
  }

  // High wind advisory
  if (wind > 25) {
    return {
      type: "warning",
      message:
        "💨 High winds detected. Delay any spraying or drone operations. Check crop support structures.",
    };
  }

  // Heavy rain
  if (rain > 60) {
    return {
      type: "warning",
      message:
        "🌧️ Heavy rain expected. Good for naturally irrigated fields. Avoid fertilizer application. Check drainage systems.",
    };
  }

  // Extreme heat
  if (temp > 35) {
    return {
      type: "warning",
      message:
        "🌡️ Extreme heat warning. Increase irrigation frequency. Provide shade for livestock. Monitor heat stress in crops.",
    };
  }

  // Freezing
  if (temp < 0) {
    return {
      type: "warning",
      message:
        "❄️ Freezing temperatures expected. Protect sensitive crops. Ensure livestock have adequate shelter. Check heating systems.",
    };
  }

  // High humidity + warmth = fungal risk
  if (humidity > 85 && temp > 20) {
    return {
      type: "warning",
      message:
        "💧 High humidity with warm temperatures. Increased risk of fungal diseases. Consider preventive fungicide application.",
    };
  }

  // Soil moisture specific advisory
  if (soilMoisture !== undefined) {
    if (soilMoisture < 20) {
      return {
        type: "warning",
        message:
          "🏜️ Very low soil moisture detected. Immediate irrigation recommended to prevent crop stress.",
      };
    }
    if (soilMoisture > 80) {
      return {
        type: "warning",
        message:
          "💧 Excessive soil moisture detected. Hold off on irrigation. Check for waterlogging and root rot risk.",
      };
    }
  }

  // Ideal conditions
  if (condition === "Sunny" && temp > 20 && temp < 30) {
    return {
      type: "info",
      message:
        "☀️ Ideal conditions for field work. Good day for harvesting, spraying, and drone surveys. Optimal growing conditions.",
    };
  }

  if (condition === "Partly Cloudy" && temp > 15 && temp < 28) {
    return {
      type: "info",
      message:
        "🌤️ Favorable weather conditions. Continue regular farm operations. Monitor for any sudden changes.",
    };
  }

  return {
    type: "info",
    message:
      "📋 Normal weather conditions. Proceed with scheduled farm activities. No weather-related concerns.",
  };
}

/**
 * Transform AgroMonitoring weather response into our app's WeatherData format
 */
export function transformAMWeatherToAppFormat(
  data: AMWeatherResponse,
  soilData?: AMSoilResponse
) {
  const current = data.current;
  const weatherId = current.weather[0]?.id || 800;
  const condition = getAMCondition(weatherId);
  const rain = current.rain?.["1h"] ?? 0;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const soilMoisture = soilData?.data?.[0]?.soil_moisture;

  const advisoryInput = {
    condition,
    temp: Math.round(current.temp),
    humidity: current.humidity,
    rain: Math.round(rain),
    wind: Math.round(current.wind_speed),
    soilMoisture,
  };

  const advisory = getAMCropAdvisory(advisoryInput);

  return {
    current: {
      temperature: Math.round(current.temp),
      humidity: current.humidity,
      rain: Math.round(rain),
      wind: Math.round(current.wind_speed),
      condition,
      icon: current.weather[0]?.icon || "01d",
      feelsLike: Math.round(current.feels_like),
      uvIndex: current.uvi,
    },
    forecast: data.daily.slice(0, 7).map((day) => {
      const date = new Date(day.dt * 1000);
      const dayCondition = getAMCondition(day.weather[0]?.id || 800);
      return {
        day: dayNames[date.getDay()],
        date: date.toISOString().split("T")[0],
        temp: Math.round(day.temp.day),
        tempMin: Math.round(day.temp.min),
        tempMax: Math.round(day.temp.max),
        humidity: day.humidity,
        rain: Math.round((day.pop || 0) * 100),
        wind: Math.round(day.wind_speed),
        condition: dayCondition,
        icon: day.weather[0]?.icon || "01d",
        description: day.weather[0]?.description || "",
      };
    }),
    advisory,
    location: {
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
    },
    // Extra agro data
    soil: soilData
      ? {
          moisture: soilData.data?.[0]?.soil_moisture ?? null,
          moisture10: soilData.data?.[0]?.soil_moisture_10 ?? null,
          moisture20: soilData.data?.[0]?.soil_moisture_20 ?? null,
          moisture40: soilData.data?.[0]?.soil_moisture_40 ?? null,
          moisture60: soilData.data?.[0]?.soil_moisture_60 ?? null,
          moisture100: soilData.data?.[0]?.soil_moisture_100 ?? null,
          surfaceTemp: soilData.data?.[0]?.surface_temp ?? null,
        }
      : null,
  };
}

