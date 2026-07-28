import { NextResponse } from "next/server";

interface OpenWeatherCurrent {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  weather: { id: number; main: string; description: string; icon: string }[];
  rain?: { "1h": number };
  pop?: number;
}

interface OpenWeatherDaily {
  dt: number;
  temp: { min: number; max: number; day: number };
  feels_like: { day: number };
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  weather: { id: number; main: string; description: string; icon: string }[];
  pop: number;
  rain?: number;
}

interface OpenWeatherResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: OpenWeatherCurrent;
  daily: OpenWeatherDaily[];
}

interface DailyAccumulator {
  dt: number;
  temp: { min: number; max: number; day: number };
  feels_like: { day: number };
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  weather: { id: number; main: string; description: string; icon: string }[];
  pop: number;
  rain?: number;
}

function getWeatherCondition(id: number): string {
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

function getCropAdvisory(weather: {
  condition: string;
  temp: number;
  humidity: number;
  rain: number;
  wind: number;
}): { type: "info" | "warning" | "danger"; message: string } {
  const { condition, temp, humidity, rain, wind } = weather;

  if (condition === "Stormy" || (rain > 70 && wind > 30)) {
    return {
      type: "danger",
      message:
        "⚠️ Severe weather expected. Secure equipment and structures. Avoid field work. Consider delaying irrigation.",
    };
  }

  if (wind > 25) {
    return {
      type: "warning",
      message:
        "💨 High winds detected. Delay any spraying or drone operations. Check crop support structures.",
    };
  }

  if (rain > 60) {
    return {
      type: "warning",
      message:
        "🌧️ Heavy rain expected. Good for naturally irrigated fields. Avoid fertilizer application. Check drainage systems.",
    };
  }

  if (temp > 35) {
    return {
      type: "warning",
      message:
        "🌡️ Extreme heat warning. Increase irrigation frequency. Provide shade for livestock. Monitor heat stress in crops.",
    };
  }

  if (temp < 0) {
    return {
      type: "warning",
      message:
        "❄️ Freezing temperatures expected. Protect sensitive crops. Ensure livestock have adequate shelter. Check heating systems.",
    };
  }

  if (humidity > 85 && temp > 20) {
    return {
      type: "warning",
      message:
        "💧 High humidity with warm temperatures. Increased risk of fungal diseases. Consider preventive fungicide application.",
    };
  }

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

function formatWeatherData(data: OpenWeatherResponse) {
  const current = data.current;
  const weatherId = current.weather[0]?.id || 800;
  const condition = getWeatherCondition(weatherId);

  const currentForecast = {
    condition,
    temp: Math.round(current.temp),
    humidity: current.humidity,
    rain: Math.round((current.pop || 0) * 100),
    wind: Math.round(current.wind_speed),
  };

  const displayCurrent = {
    temperature: Math.round(current.temp),
    humidity: current.humidity,
    rain: Math.round((current.pop || 0) * 100),
    wind: Math.round(current.wind_speed),
    condition,
    icon: current.weather[0]?.icon || "01d",
    feelsLike: Math.round(current.feels_like),
    uvIndex: 0,
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const forecast = data.daily.slice(0, 7).map((day) => {
    const date = new Date(day.dt * 1000);
    const dayCondition = getWeatherCondition(day.weather[0]?.id || 800);
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
  });

  const advisory = getCropAdvisory(currentForecast);

  return {
    current: displayCurrent,
    forecast,
    advisory,
    location: {
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
    },
  };
}

function processForecastData(forecastData: {
  list?: Array<{
    dt: number;
    main: { temp: number; feels_like: number; humidity: number };
    wind: { speed: number; deg: number };
    weather: { id: number; main: string; description: string; icon: string }[];
    pop?: number;
    rain?: { "3h": number };
  }>;
}): DailyAccumulator[] {
  const dailyMap = new Map<string, DailyAccumulator>();

  for (const item of forecastData.list || []) {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        dt: item.dt,
        temp: { min: item.main.temp, max: item.main.temp, day: item.main.temp },
        feels_like: { day: item.main.feels_like },
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        wind_deg: item.wind.deg,
        weather: item.weather,
        pop: item.pop || 0,
      });
    } else {
      const existing = dailyMap.get(date)!;
      existing.temp.min = Math.min(existing.temp.min, item.main.temp);
      existing.temp.max = Math.max(existing.temp.max, item.main.temp);
      existing.temp.day = (existing.temp.day + item.main.temp) / 2;
      existing.feels_like.day = (existing.feels_like.day + item.main.feels_like) / 2;
      existing.pop = Math.max(existing.pop, item.pop || 0);
      if (item.rain?.["3h"]) {
        existing.rain = (existing.rain || 0) + item.rain["3h"];
      }
    }
  }

  return Array.from(dailyMap.values()).slice(0, 7);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat") || process.env.DEFAULT_FARM_LAT || "40.7128";
  const lon = searchParams.get("lon") || process.env.DEFAULT_FARM_LON || "-74.006";
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenWeatherMap API key not configured" },
      { status: 400 }
    );
  }

  try {
    // Try One Call API 3.0 first
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&exclude=minutely,hourly,alerts`;
    const response = await fetch(url);

    // If OneCall 3.0 fails (401/403), fall back to 2.5 endpoints
    if (response.status === 401 || response.status === 403) {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
      ]);

      if (!currentRes.ok) {
        return NextResponse.json(
          { error: "Weather API request failed", status: currentRes.status },
          { status: currentRes.status }
        );
      }

      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();
      const daily = processForecastData(forecastData);

      const weather: OpenWeatherResponse = {
        lat: currentData.coord.lat,
        lon: currentData.coord.lon,
        timezone: currentData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezone_offset: 0,
        current: {
          dt: currentData.dt,
          temp: currentData.main.temp,
          feels_like: currentData.main.feels_like,
          humidity: currentData.main.humidity,
          wind_speed: currentData.wind.speed,
          wind_deg: currentData.wind.deg,
          weather: currentData.weather,
          pop: 0,
        },
        daily,
      };

      return NextResponse.json(formatWeatherData(weather));
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Weather API request failed", status: response.status },
        { status: response.status }
      );
    }

    const data: OpenWeatherResponse = await response.json();
    return NextResponse.json(formatWeatherData(data));
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

