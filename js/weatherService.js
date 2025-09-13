
const WeatherService = {
    getWeatherData() {
        const currentLocation = AppState.getCurrentLocation();
        if (!currentLocation) {
            return;
        }

        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric`;

        Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)])
            .then((responses) => Promise.all(responses.map((r) => r.json())))
            .then(([currentData, forecastData]) => {
                const weatherData = { current: currentData, forecast: forecastData };
                AppState.setWeatherData(weatherData);

                WeatherDisplay.showCurrentWeather(currentData);
                WeatherDisplay.showWeatherForecast(forecastData);
                
                const alertMessage = WeatherUtils.checkForWeatherAlerts(currentData);
                DOMUtils.showWeatherAlert(alertMessage);
                
                DOMUtils.showWeatherSections();
                FarmingAdviceService.getFarmingAdvice();
            })
            .catch((error) => {
                console.error("Weather data error:", error);
            });
    },

    refreshWeatherData() {
        const currentLocation = AppState.getCurrentLocation();
        if (currentLocation) {
            this.getWeatherData();
        } else {
            LocationService.getCurrentLocation();
        }
    }
};


if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherService;
} else {
    window.WeatherService = WeatherService;
}