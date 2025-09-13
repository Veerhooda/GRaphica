// locationService.js - Location-related functionality
const LocationService = {
    getCurrentLocation() {
        DOMUtils.showLocationStatus("Getting your location...");

        if (!navigator.geolocation) {
            DOMUtils.showLocationError("Location not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            this.handleLocationSuccess.bind(this),
            this.handleLocationError.bind(this),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    },

    handleLocationSuccess(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const location = { lat: lat, lon: lon };
        
        AppState.setCurrentLocation(location);
        this.getLocationName(lat, lon);
    },

    handleLocationError(error) {
        console.error("Location error:", error);
        DOMUtils.showLocationError("Could not get your location. Please enter it manually.");
    },

    getLocationName(lat, lon) {
        const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${CONFIG.OPENWEATHER_API_KEY}`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                let locationName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                
                if (data.length > 0) {
                    const location = data[0];
                    locationName = `${location.name}, ${location.state || ""} ${location.country}`.replace(/,\s*,/, ",");
                }

                DOMUtils.showLocationInfo(locationName, lat, lon);
                MapManager.updateMapView(lat, lon, locationName);
                WeatherService.getWeatherData();
            })
            .catch((error) => {
                console.error("Geocoding error:", error);
                const locationName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                DOMUtils.showLocationInfo(locationName, lat, lon);
                MapManager.updateMapView(lat, lon, locationName);
                WeatherService.getWeatherData();
            });
    },

    searchForLocation() {
        const locationInput = document.getElementById("customLocation");
        const query = locationInput.value.trim();

        if (!query) {
            return;
        }

        DOMUtils.showLocationStatus("Searching for location...");

        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${CONFIG.OPENWEATHER_API_KEY}`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.length === 0) {
                    throw new Error("Location not found");
                }

                const location = data[0];
                AppState.setCurrentLocation({ lat: location.lat, lon: location.lon });

                const locationName = `${location.name}, ${location.country}`;
                DOMUtils.showLocationInfo(locationName, location.lat, location.lon);
                MapManager.updateMapView(location.lat, location.lon, locationName);
                WeatherService.getWeatherData();
            })
            .catch((error) => {
                console.error("Location search error:", error);
                DOMUtils.showLocationError("Location not found. Please try again.");
            });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationService;
} else {
    window.LocationService = LocationService;
}