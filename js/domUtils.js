// domUtils.js - DOM manipulation utilities
const DOMUtils = {
    showLocationInfo(locationName, lat, lon) {
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
    },

    showLocationStatus(message) {
        document.getElementById("locationInfo").innerHTML = 
            `<div class="text-gray-600">${message}</div>`;
    },

    showLocationError(message) {
        document.getElementById("locationInfo").innerHTML = 
            `<div class="text-red-600">❌ ${message}</div>`;
    },

    showWeatherAlert(message) {
        const alertBanner = document.getElementById("weatherAlert");
        const alertText = document.getElementById("alertText");
        
        if (message) {
            alertText.textContent = message;
            alertBanner.classList.remove("hidden");
        } else {
            alertBanner.classList.add("hidden");
        }
    },

    showWeatherSections() {
        document.getElementById("currentWeatherSection").classList.remove("hidden");
        document.getElementById("forecastSection").classList.remove("hidden");
        document.getElementById("adviceSection").classList.remove("hidden");
    },

    showAdviceLoading(show = true) {
        const loadingElement = document.getElementById("adviceLoading");
        const adviceContainer = document.getElementById("farmingAdvice");
        
        if (show) {
            loadingElement.classList.remove("hidden");
            adviceContainer.classList.add("hidden");
        } else {
            loadingElement.classList.add("hidden");
            adviceContainer.classList.remove("hidden");
        }
    },

    showAdviceError(message) {
        document.getElementById("adviceLoading").innerHTML = 
            `<div class="text-red-600 text-center">❌ ${message}</div>`;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMUtils;
} else {
    window.DOMUtils = DOMUtils;
}