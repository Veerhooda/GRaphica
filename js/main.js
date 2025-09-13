
document.addEventListener("DOMContentLoaded", function () {
    
    AppMain.init();
});

const AppMain = {
    init() {
        
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


if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppMain;
} else {
    window.AppMain = AppMain;
}