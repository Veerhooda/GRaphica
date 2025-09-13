// main.js - Application initialization and coordination
document.addEventListener("DOMContentLoaded", function () {
    // Initialize the application
    AppMain.init();
});

const AppMain = {
    init() {
        // Initialize all components in the correct order
        this.setupEventHandlers();
        this.initializeMap();
        this.getCurrentLocation();
    },

    setupEventHandlers() {
        EventHandlers.init();
    },

    initializeMap() {
        MapManager.createMap();
    },

    getCurrentLocation() {
        LocationService.getCurrentLocation();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppMain;
} else {
    window.AppMain = AppMain;
}