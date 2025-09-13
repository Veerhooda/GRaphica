// farmingAdviceService.js - AI farming advice functionality
const FarmingAdviceService = {
    getFarmingAdvice() {
        const weatherData = AppState.getWeatherData();
        if (!weatherData) {
            return;
        }

        DOMUtils.showAdviceLoading(true);
        document.getElementById("farmingAdvice").innerHTML = "";

        const weatherSummary = WeatherUtils.prepareWeatherSummary(weatherData);

        this.callAIForAdvice(weatherSummary)
            .then((advice) => {
                this.showFarmingAdvice(advice);
                DOMUtils.showAdviceLoading(false);
            })
            .catch((error) => {
                console.error("AI advice error:", error);
                DOMUtils.showAdviceError("Failed to get farming advice. Please try again.");
            });
    },

    callAIForAdvice(weatherSummary) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
        const prompt = this.buildAdvicePrompt(weatherSummary);

        return fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.6, topK: 40 },
            }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("AI API error");
            }
            return response.json();
        })
        .then((result) => {
            const adviceText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!adviceText) {
                throw new Error("No advice generated");
            }
            return this.parseAdviceText(adviceText);
        });
    },

    buildAdvicePrompt(weatherData) {
        const current = weatherData.current;
        const forecast = weatherData.forecast;

        let prompt = `You are an expert agricultural advisor. Analyze the weather data and give farming advice.

CURRENT WEATHER:
- Temperature: ${current.temperature.toFixed(1)}°C (feels like ${current.feels_like.toFixed(1)}°C)
- Humidity: ${current.humidity}%
- Wind: ${current.windSpeed.toFixed(1)} m/s
- Conditions: ${current.description}

5-DAY FORECAST:
`;

        forecast.forEach((day, i) => {
            prompt += `- Day ${i + 1}: Max ${day.temp_max.toFixed(0)}°C, Min ${day.temp_min.toFixed(0)}°C, ${day.description}\n`;
        });

        prompt += `
Based on this data, provide practical advice for these categories. Each category should have 2-3 bullet points. Each bullet point should be a single, short sentence.

### IMMEDIATE_ACTIONS
-

### WEEKLY_PLANNING
-

### IRRIGATION_MANAGEMENT
-

### CROP_PROTECTION
-

### HARVESTING_PLANTING
-
`;

        return prompt;
    },

    parseAdviceText(responseText) {
        const sections = {
            immediate: [],
            weekly: [],
            irrigation: [],
            protection: [],
            harvesting: [],
        };

        const sectionMap = {
            IMMEDIATE_ACTIONS: "immediate",
            WEEKLY_PLANNING: "weekly",
            IRRIGATION_MANAGEMENT: "irrigation",
            CROP_PROTECTION: "protection",
            HARVESTING_PLANTING: "harvesting",
        };

        let currentSection = null;
        const lines = responseText.split("\n");

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            const sectionKey = Object.keys(sectionMap).find(key => trimmedLine.includes(key));

            if (sectionKey) {
                currentSection = sectionMap[sectionKey];
            } else if (currentSection && (trimmedLine.startsWith("-") || trimmedLine.startsWith("*"))) {
                const advice = trimmedLine.substring(1).trim();
                if (advice) {
                    sections[currentSection].push(advice);
                }
            }
        });

        // Ensure all sections have at least one item
        Object.keys(sections).forEach((key) => {
            if (sections[key].length === 0) {
                sections[key].push("Consult local agricultural experts for detailed advice.");
            }
        });

        return sections;
    },

    showFarmingAdvice(advice) {
        const container = document.getElementById("farmingAdvice");
        container.innerHTML = "";

        const sections = [
            { title: "Immediate Actions", emoji: "⚡", items: advice.immediate },
            { title: "This Week", emoji: "📅", items: advice.weekly },
            { title: "Irrigation", emoji: "💧", items: advice.irrigation },
            { title: "Crop Protection", emoji: "🛡️", items: advice.protection },
            { title: "Harvest & Planting", emoji: "🌱", items: advice.harvesting },
        ];

        sections.forEach((section) => {
            if (section.items && section.items.length > 0) {
                const sectionDiv = document.createElement("div");
                sectionDiv.className = "bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4";

                let itemsHtml = "";
                section.items.forEach((item) => {
                    itemsHtml += `
                        <li class="flex items-start mb-3">
                            <span class="text-green-500 mr-3 mt-1">✓</span>
                            <span class="text-gray-700">${item}</span>
                        </li>
                    `;
                });

                sectionDiv.innerHTML = `
                    <h3 class="text-xl font-bold mb-4 text-gray-800">
                        ${section.emoji} ${section.title}
                    </h3>
                    <ul>${itemsHtml}</ul>
                `;

                container.appendChild(sectionDiv);
            }
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FarmingAdviceService;
} else {
    window.FarmingAdviceService = FarmingAdviceService;
}