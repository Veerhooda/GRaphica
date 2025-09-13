// eventHandlers.js - Event handling and UI interactions
const EventHandlers = {
    setupButtons() {
        const locationBtn = document.getElementById("locationBtn");
        const searchBtn = document.getElementById("searchLocationBtn");
        const refreshBtn = document.getElementById("refreshBtn");
        const locationInput = document.getElementById("customLocation");

        if (locationBtn) {
            locationBtn.addEventListener("click", () => LocationService.getCurrentLocation());
        }
        
        if (searchBtn) {
            searchBtn.addEventListener("click", () => LocationService.searchForLocation());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => WeatherService.refreshWeatherData());
        }
        
        if (locationInput) {
            locationInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    LocationService.searchForLocation();
                }
            });
        }
    },

    init() {
        this.setupButtons();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventHandlers;
} else {
    window.EventHandlers = EventHandlers;
}