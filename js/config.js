// config.js - Configuration constants
const CONFIG = {
    OPENWEATHER_API_KEY: "f933eae88b81a12566359df43b926363",
    GEMINI_API_KEY: "AIzaSyCYxkosc3Ph6lnBTywdjS4gsv-peWNL8u0",
    GEMINI_MODEL: "gemini-2.5-flash-preview-05-20",
    MAP_DEFAULT_VIEW: [20.5937, 78.9629], // India center
    MAP_DEFAULT_ZOOM: 5,
    MAP_LOCATION_ZOOM: 12
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}