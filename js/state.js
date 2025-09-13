// state.js - Application state management
const AppState = {
    map: null,
    currentLocation: null,
    weatherData: null,

    setMap(mapInstance) {
        this.map = mapInstance;
    },

    setCurrentLocation(location) {
        this.currentLocation = location;
    },

    setWeatherData(data) {
        this.weatherData = data;
    },

    getCurrentLocation() {
        return this.currentLocation;
    },

    getWeatherData() {
        return this.weatherData;
    },

    getMap() {
        return this.map;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppState;
} else {
    window.AppState = AppState;
}