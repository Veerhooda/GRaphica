// API Keys

const OPENWEATHER_API_KEY = "f933eae88b81a12566359df43b926363";

const GEMINI_API_KEY = "AIzaSyCYxkosc3Ph6lnBTywdjS4gsv-peWNL8u0";

// Global variables

let map = null;

let currentLocation = null;

let weatherData = null;

// Initialize the app when page loads

document.addEventListener("DOMContentLoaded", function () {
  setupButtons();

  createMap();

  getCurrentLocation();
});

// Set up button click events

function setupButtons() {
  const locationBtn = document.getElementById("locationBtn");

  const searchBtn = document.getElementById("searchLocationBtn");

  const refreshBtn = document.getElementById("refreshBtn");

  const locationInput = document.getElementById("customLocation");

  locationBtn.addEventListener("click", getCurrentLocation);

  searchBtn.addEventListener("click", searchForLocation);

  refreshBtn.addEventListener("click", refreshWeatherData);

  locationInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchForLocation();
    }
  });
}

// Create the initial map

function createMap() {
  map = L.map("map").setView([20.5937, 78.9629], 5); // India center

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
}

// Get user's current location

function getCurrentLocation() {
  showLocationStatus("Getting your location...");

  if (!navigator.geolocation) {
    showLocationError("Location not supported by your browser");

    return;
  }

  navigator.geolocation.getCurrentPosition(
    handleLocationSuccess,

    handleLocationError,

    {
      enableHighAccuracy: true,

      timeout: 10000,

      maximumAge: 300000,
    }
  );
}

// Handle successful location detection

function handleLocationSuccess(position) {
  const lat = position.coords.latitude;

  const lon = position.coords.longitude;

  currentLocation = { lat: lat, lon: lon };

  getLocationName(lat, lon);
}

// Handle location detection errors

function handleLocationError(error) {
  console.error("Location error:", error);

  showLocationError("Could not get your location. Please enter it manually.");
}

// Get location name from coordinates

function getLocationName(lat, lon) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`;

  fetch(url)
    .then((response) => response.json())

    .then((data) => {
      let locationName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

      if (data.length > 0) {
        const location = data[0];

        locationName = `${location.name}, ${location.state || ""} ${
          location.country
        }`.replace(/,\s*,/, ",");
      }

      showLocationInfo(locationName, lat, lon);

      updateMapView(lat, lon, locationName);

      getWeatherData();
    })

    .catch((error) => {
      console.error("Geocoding error:", error);

      const locationName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

      showLocationInfo(locationName, lat, lon);

      updateMapView(lat, lon, locationName);

      getWeatherData();
    });
}

// Search for a custom location

function searchForLocation() {
  const locationInput = document.getElementById("customLocation");

  const query = locationInput.value.trim();

  if (!query) {
    return;
  }

  showLocationStatus("Searching for location...");

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${OPENWEATHER_API_KEY}`;

  fetch(url)
    .then((response) => response.json())

    .then((data) => {
      if (data.length === 0) {
        throw new Error("Location not found");
      }

      const location = data[0];

      currentLocation = { lat: location.lat, lon: location.lon };

      const locationName = `${location.name}, ${location.country}`;

      showLocationInfo(locationName, location.lat, location.lon);

      updateMapView(location.lat, location.lon, locationName);

      getWeatherData();
    })

    .catch((error) => {
      console.error("Location search error:", error);

      showLocationError("Location not found. Please try again.");
    });
}

// Show location information

function showLocationInfo(locationName, lat, lon) {
  const content = `

        <div>

            <div class="text-lg font-bold text-gray-800 mb-2">

                📍 ${locationName}

            </div>

            <div class="text-sm text-gray-600">

                🌍 Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}

            </div>

        </div>

    `;

  document.getElementById("locationInfo").innerHTML = content;
}

// Show location loading status

function showLocationStatus(message) {
  document.getElementById(
    "locationInfo"
  ).innerHTML = `<div class="text-gray-600">${message}</div>`;
}

// Show location error

function showLocationError(message) {
  document.getElementById(
    "locationInfo"
  ).innerHTML = `<div class="text-red-600">❌ ${message}</div>`;
}

// Update map view and marker

function updateMapView(lat, lon, locationName) {
  map.setView([lat, lon], 12); // Remove existing markers

  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  }); // Add new marker

  L.marker([lat, lon])

    .addTo(map)

    .bindPopup(`<b>${locationName}</b><br>Your farming location`)

    .openPopup();
}

// Get weather data from API

function getWeatherData() {
  if (!currentLocation) {
    return;
  }

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

  Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)])

    .then((responses) => Promise.all(responses.map((r) => r.json())))

    .then(([currentData, forecastData]) => {
      weatherData = { current: currentData, forecast: forecastData };

      showCurrentWeather(currentData);

      showWeatherForecast(forecastData);

      checkForWeatherAlerts(currentData);

      showWeatherSections();

      getFarmingAdvice();
    })

    .catch((error) => {
      console.error("Weather data error:", error);
    });
}

// Display current weather

function showCurrentWeather(data) {
  const temp = Math.round(data.main.temp);

  const feelsLike = Math.round(data.main.feels_like);

  const humidity = data.main.humidity;

  const windSpeed = data.wind.speed;

  const description = data.weather[0].description;

  const minTemp = Math.round(data.main.temp_min);

  const maxTemp = Math.round(data.main.temp_max);

  const pressure = data.main.pressure;

  const weatherIcon = getWeatherIcon(data.weather[0].id);

  const weatherHtml = `

        <div class="grid md:grid-cols-3 gap-6">

            <div class="text-center">

                <div class="text-6xl mb-4">${weatherIcon}</div>

                <h3 class="text-3xl font-bold text-gray-800">${temp}°C</h3>

                <p class="text-gray-600 capitalize">${description}</p>

            </div>

            <div class="space-y-4">

                <div class="flex justify-between">

                    <span class="text-gray-600">Feels like:</span>

                    <span class="font-bold">${feelsLike}°C</span>

                </div>

                <div class="flex justify-between">

                    <span class="text-gray-600">Humidity:</span>

                    <span class="font-bold">${humidity}%</span>

                </div>

                <div class="flex justify-between">

                    <span class="text-gray-600">Wind Speed:</span>

                    <span class="font-bold">${windSpeed} m/s</span>

                </div>

            </div>

            <div class="space-y-4">

                <div class="flex justify-between">

                    <span class="text-gray-600">Min Temp:</span>

                    <span class="font-bold">${minTemp}°C</span>

                </div>

                <div class="flex justify-between">

                    <span class="text-gray-600">Max Temp:</span>

                    <span class="font-bold">${maxTemp}°C</span>

                </div>

                <div class="flex justify-between">

                    <span class="text-gray-600">Pressure:</span>

                    <span class="font-bold">${pressure} hPa</span>

                </div>

            </div>

        </div>

    `;

  document.getElementById("currentWeather").innerHTML = weatherHtml;
}

// Show weather forecast for next 7 days

function showWeatherForecast(data) {
  const forecastContainer = document.getElementById("forecast");

  forecastContainer.innerHTML = "";

  const dailyForecasts = groupForecastByDay(data.list);

  const next7Days = dailyForecasts.slice(0, 7);

  next7Days.forEach(function (day, index) {
    const date = new Date(day.dt * 1000);

    const dayName =
      index === 0
        ? "Today"
        : date.toLocaleDateString("en", { weekday: "short" });

    const weatherIcon = getWeatherIcon(day.weather[0].id);

    const maxTemp = Math.round(day.temp.max);

    const minTemp = Math.round(day.temp.min);

    const card = document.createElement("div");

    card.className =
      "weather-card bg-white border border-gray-200 rounded-lg p-4 text-center";

    card.innerHTML = `

            <h4 class="font-bold text-gray-800 mb-2">${dayName}</h4>

            <div class="text-3xl mb-2">${weatherIcon}</div>

            <div class="text-lg font-bold text-gray-800">${maxTemp}°</div>

            <div class="text-sm text-gray-600">${minTemp}°</div>

        `;

    forecastContainer.appendChild(card);
  });
}

// Group forecast data by day

function groupForecastByDay(forecastList) {
  const grouped = {};

  forecastList.forEach(function (item) {
    const date = new Date(item.dt * 1000).toDateString();

    if (!grouped[date]) {
      grouped[date] = {
        dt: item.dt,

        temp: { min: item.main.temp_min, max: item.main.temp_max },

        weather: [item.weather[0]],
      };
    } else {
      grouped[date].temp.min = Math.min(
        grouped[date].temp.min,
        item.main.temp_min
      );

      grouped[date].temp.max = Math.max(
        grouped[date].temp.max,
        item.main.temp_max
      );
    }
  });

  return Object.values(grouped);
}

// Check for weather alerts

function checkForWeatherAlerts(currentWeather) {
  const alertBanner = document.getElementById("weatherAlert");

  const alertText = document.getElementById("alertText");

  let alertMessage = "";

  const temp = currentWeather.main.temp;

  const windSpeed = currentWeather.wind.speed;

  const humidity = currentWeather.main.humidity;

  if (temp > 40) {
    alertMessage =
      "🔥 Extreme Heat Alert: Take precautions to protect crops from heat stress.";
  } else if (temp < 5) {
    alertMessage = "🧊 Cold Alert: Risk of frost damage to sensitive crops.";
  } else if (windSpeed > 10) {
    alertMessage =
      "💨 High Wind Alert: Secure lightweight structures and protect young plants.";
  } else if (humidity > 85) {
    alertMessage =
      "💧 High Humidity Alert: Increase ventilation and monitor for fungal diseases.";
  }

  if (alertMessage) {
    alertText.textContent = alertMessage;

    alertBanner.classList.remove("hidden");
  } else {
    alertBanner.classList.add("hidden");
  }
}

// Show weather sections

function showWeatherSections() {
  document.getElementById("currentWeatherSection").classList.remove("hidden");

  document.getElementById("forecastSection").classList.remove("hidden");

  document.getElementById("adviceSection").classList.remove("hidden");
}

// Get farming advice from AI

function getFarmingAdvice() {
  if (!weatherData) {
    return;
  }

  const loadingElement = document.getElementById("adviceLoading");

  const adviceContainer = document.getElementById("farmingAdvice");

  loadingElement.classList.remove("hidden");

  adviceContainer.classList.add("hidden");

  adviceContainer.innerHTML = "";

  const weatherSummary = prepareWeatherSummary();

  callAIForAdvice(weatherSummary)
    .then(function (advice) {
      showFarmingAdvice(advice);

      loadingElement.classList.add("hidden");

      adviceContainer.classList.remove("hidden");
    })

    .catch(function (error) {
      console.error("AI advice error:", error);

      loadingElement.innerHTML =
        '<div class="text-red-600 text-center">❌ Failed to get farming advice. Please try again.</div>';
    });
}

// Prepare weather summary for AI

function prepareWeatherSummary() {
  const current = weatherData.current;

  const forecast = weatherData.forecast;

  const dailyForecasts = groupForecastByDay(forecast.list).slice(0, 5);

  return {
    current: {
      temperature: current.main.temp,

      feels_like: current.main.feels_like,

      humidity: current.main.humidity,

      windSpeed: current.wind.speed,

      description: current.weather[0].description,

      pressure: current.main.pressure,
    },

    forecast: dailyForecasts.map(function (day) {
      return {
        date: new Date(day.dt * 1000).toISOString(),

        temp_max: day.temp.max,

        temp_min: day.temp.min,

        description: day.weather[0].description,
      };
    }),
  };
}

// Call AI API for advice

function callAIForAdvice(weatherSummary) {
  const model = "gemini-2.5-flash-preview-05-20";

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = buildAdvicePrompt(weatherSummary);

  return fetch(apiUrl, {
    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],

      generationConfig: { temperature: 0.6, topK: 40 },
    }),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("AI API error");
      }

      return response.json();
    })

    .then(function (result) {
      const adviceText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!adviceText) {
        throw new Error("No advice generated");
      }

      return parseAdviceText(adviceText);
    });
}

// Build prompt for AI

function buildAdvicePrompt(weatherData) {
  const current = weatherData.current;

  const forecast = weatherData.forecast;

  let prompt = `You are an expert agricultural advisor. Analyze the weather data and give farming advice.



CURRENT WEATHER:

- Temperature: ${current.temperature.toFixed(
    1
  )}°C (feels like ${current.feels_like.toFixed(1)}°C)

- Humidity: ${current.humidity}%

- Wind: ${current.windSpeed.toFixed(1)} m/s

- Conditions: ${current.description}



5-DAY FORECAST:

`;

  forecast.forEach(function (day, i) {
    prompt += `- Day ${i + 1}: Max ${day.temp_max.toFixed(
      0
    )}°C, Min ${day.temp_min.toFixed(0)}°C, ${day.description}\n`;
  });

  prompt += `

Based on this data, provide practical advice for these categories. Each category should have 2-3 bullet points. Each bullet point should be a single, short sentence.



### IMMEDIATE_ACTIONS

-

### WEEKLY_PLANNING

-

### IRRIGATION_MANAGEMENT

-

### CROP_PROTECTION

-

### HARVESTING_PLANTING

-

`;

  return prompt;
}

// Parse AI response text

function parseAdviceText(responseText) {
  const sections = {
    immediate: [],

    weekly: [],

    irrigation: [],

    protection: [],

    harvesting: [],
  };

  const sectionMap = {
    IMMEDIATE_ACTIONS: "immediate",

    WEEKLY_PLANNING: "weekly",

    IRRIGATION_MANAGEMENT: "irrigation",

    CROP_PROTECTION: "protection",

    HARVESTING_PLANTING: "harvesting",
  };

  let currentSection = null;

  const lines = responseText.split("\n");

  lines.forEach(function (line) {
    const trimmedLine = line.trim(); // Check if line contains a section header

    const sectionKey = Object.keys(sectionMap).find(function (key) {
      return trimmedLine.includes(key);
    });

    if (sectionKey) {
      currentSection = sectionMap[sectionKey];
    } else if (
      currentSection &&
      (trimmedLine.startsWith("-") || trimmedLine.startsWith("*"))
    ) {
      const advice = trimmedLine.substring(1).trim();

      if (advice) {
        sections[currentSection].push(advice);
      }
    }
  }); // Add fallback advice for empty sections

  Object.keys(sections).forEach(function (key) {
    if (sections[key].length === 0) {
      sections[key].push(
        "Consult local agricultural experts for detailed advice."
      );
    }
  });

  return sections;
}

// Show farming advice

function showFarmingAdvice(advice) {
  const container = document.getElementById("farmingAdvice");

  container.innerHTML = "";

  const sections = [
    { title: "Immediate Actions", emoji: "⚡", items: advice.immediate },

    { title: "This Week", emoji: "📅", items: advice.weekly },

    { title: "Irrigation", emoji: "💧", items: advice.irrigation },

    { title: "Crop Protection", emoji: "🛡️", items: advice.protection },

    { title: "Harvest & Planting", emoji: "🌱", items: advice.harvesting },
  ];

  sections.forEach(function (section) {
    if (section.items && section.items.length > 0) {
      const sectionDiv = document.createElement("div");

      sectionDiv.className =
        "bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4";

      let itemsHtml = "";

      section.items.forEach(function (item) {
        itemsHtml += `

                    <li class="flex items-start mb-3">

                        <span class="text-green-500 mr-3 mt-1">✓</span>

                        <span class="text-gray-700">${item}</span>

                    </li>

                `;
      });

      sectionDiv.innerHTML = `

                <h3 class="text-xl font-bold mb-4 text-gray-800">

                    ${section.emoji} ${section.title}

                </h3>

                <ul>${itemsHtml}</ul>

            `;

      container.appendChild(sectionDiv);
    }
  });
}

// Get weather icon emoji

function getWeatherIcon(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return "⛈️"; // Thunderstorm

  if (weatherId >= 300 && weatherId < 400) return "🌦️"; // Drizzle

  if (weatherId >= 500 && weatherId < 600) return "🌧️"; // Rain

  if (weatherId >= 600 && weatherId < 700) return "🌨️"; // Snow

  if (weatherId >= 700 && weatherId < 800) return "🌫️"; // Atmosphere

  if (weatherId === 800) return "☀️"; // Clear

  if (weatherId > 800) return "☁️"; // Clouds

  return "🌤️"; // Default
}

// Refresh weather data

function refreshWeatherData() {
  if (currentLocation) {
    getWeatherData();
  } else {
    getCurrentLocation();
  }
}
