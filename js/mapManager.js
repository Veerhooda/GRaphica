// mapManager.js - Map initialization and management
const MapManager = {
    createMap() {
        const map = L.map("map").setView(CONFIG.MAP_DEFAULT_VIEW, CONFIG.MAP_DEFAULT_ZOOM);
        
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(map);
        
        AppState.setMap(map);
        return map;
    },

    updateMapView(lat, lon, locationName) {
        const map = AppState.getMap();
        if (!map) return;

        map.setView([lat, lon], CONFIG.MAP_LOCATION_ZOOM);

        // Remove existing markers
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add new marker
        L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`<b>${locationName}</b><br>Your farming location`)
            .openPopup();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapManager;
} else {
    window.MapManager = MapManager;
}