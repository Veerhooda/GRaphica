// weatherDisplay.js - Weather data display functionality
const WeatherDisplay = {
    showCurrentWeather(data) {
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const description = data.weather[0].description;
        const minTemp = Math.round(data.main.temp_min);
        const maxTemp = Math.round(data.main.temp_max);
        const pressure = data.main.pressure;
        const weatherIcon = WeatherUtils.getWeatherIcon(data.weather[0].id);

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
    },

    showWeatherForecast(data) {
        const forecastContainer = document.getElementById("forecast");
        forecastContainer.innerHTML = "";

        const dailyForecasts = WeatherUtils.groupForecastByDay(data.list);
        const next7Days = dailyForecasts.slice(0, 7);

        next7Days.forEach(function (day, index) {
            const date = new Date(day.dt * 1000);
            const dayName = index === 0 ? "Today" : date.toLocaleDateString("en", { weekday: "short" });
            const weatherIcon = WeatherUtils.getWeatherIcon(day.weather[0].id);
            const maxTemp = Math.round(day.temp.max);
            const minTemp = Math.round(day.temp.min);

            const card = document.createElement("div");
            card.className = "weather-card bg-white border border-gray-200 rounded-lg p-4 text-center";
            card.innerHTML = `
                <h4 class="font-bold text-gray-800 mb-2">${dayName}</h4>
                <div class="text-3xl mb-2">${weatherIcon}</div>
                <div class="text-lg font-bold text-gray-800">${maxTemp}°</div>
                <div class="text-sm text-gray-600">${minTemp}°</div>
            `;

            forecastContainer.appendChild(card);
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherDisplay;
} else {
    window.WeatherDisplay = WeatherDisplay;
}