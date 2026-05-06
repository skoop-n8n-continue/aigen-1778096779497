const latitude = 31.58;
const longitude = 74.33;

const currentTempEl = document.getElementById('current-temp');
const weatherIconEl = document.getElementById('weather-icon');
const weatherDescEl = document.getElementById('weather-desc');
const forecastListEl = document.getElementById('forecast-list');

async function getWeather() {
    try {
        // Fetch current weather data from Open-Meteo
        const currentWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
        const currentResponse = await fetch(currentWeatherUrl);
        if (!currentResponse.ok) {
            throw new Error(`HTTP error! status: ${currentResponse.status}`);
        }
        const currentData = await currentResponse.json();

        // Fetch forecast weather data from Open-Meteo
        // Daily forecast: max/min temperature and weathercode
        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            throw new Error(`HTTP error! status: ${forecastResponse.status}`);
        }
        const forecastData = await forecastResponse.json();

        updateUI(currentData, forecastData);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Display error to user
        currentTempEl.textContent = '--';
        weatherDescEl.textContent = 'Failed to load weather';
        weatherIconEl.src = '';
        forecastListEl.innerHTML = '<p>Could not retrieve forecast.</p>';
    }
}

function updateUI(currentData, forecastData) {
    // Update current weather
    // Open-Meteo returns temperature in current_weather.temperature
    currentTempEl.textContent = currentData.current_weather.temperature;
    // Open-Meteo returns weather description via weathercode; mapping needed
    weatherDescEl.textContent = getWeatherDescription(currentData.current_weather.weathercode);
    // Weather icon needs to be mapped from weathercode as well
    weatherIconEl.src = getWeatherIconUrl(currentData.current_weather.weathercode);

    // Update forecast
    forecastListEl.innerHTML = ''; // Clear previous forecast
    if (forecastData.daily && forecastData.daily.time) {
        forecastData.daily.time.forEach((day, index) => {
            const date = new Date(day);
            const dayName = date.toLocaleDateString('en-US', {
                weekday: 'short'
            });
            const maxTemp = forecastData.daily.temperature_2m_max[index];
            const minTemp = forecastData.daily.temperature_2m_min[index];
            const weathercode = forecastData.daily.weathercode[index];
            const iconUrl = getWeatherIconUrl(weathercode);

            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item');
            forecastItem.innerHTML = `
                <div class="day">${dayName}</div>
                <img src="${iconUrl}" alt="Forecast Icon">
                <div class="temp">${maxTemp}° / ${minTemp}°</div>
            `;
            forecastListEl.appendChild(forecastItem);
        });
    }
}

// Helper function to map weather codes to descriptions (simplified)
// See Open-Meteo documentation for a full list: https://open-meteo.com/en/docs
function getWeatherDescription(weathercode) {
    switch (weathercode) {
        case 0: return "Clear sky";
        case 1:
        case 2:
        case 3: return "Mainly clear, partly cloudy, and overcast";
        case 45:
        case 48: return "Fog and depositing rime fog";
        case 51:
        case 53:
        case 55: return "Drizzle: light, moderate, and dense intensity";
        case 56:
        case 57: return "Freezing Drizzle: light and dense intensity";
        case 61:
        case 63:
        case 65: return "Rain: slight, moderate and heavy intensity";
        case 66:
        case 67: return "Freezing Rain: light and heavy intensity";
        case 71:
        case 73:
        case 75: return "Snow fall: slight, moderate, and heavy intensity";
        case 77: return "Snow grains";
        case 80:
        case 81:
        case 82: return "Showers: slight, moderate, and violent";
        case 85:
        case 86: return "Snow showers: slight and heavy";
        case 95:
        case 96:
        case 99: return "Thunderstorm: slight or moderate / thunderstorm with hail";
        default: return "Unknown weather";
    }
}

// Helper function to map weather codes to icon URLs (simplified)
// Using a generic set of icons for now. A more comprehensive mapping might be needed.
// This mapping is illustrative and may need adjustment based on actual icon availability.
function getWeatherIconUrl(weathercode) {
    // Placeholder icons, these URLs might not be directly usable or might need hosting.
    // For a real app, you'd likely use a library of weather icons or a service like open-meteo.com's own icons if available.
    // For demonstration, I'll use generic descriptions.
    switch (weathercode) {
        case 0: return "/icons/clear_day.png"; // Placeholder
        case 1:
        case 2:
        case 3: return "/icons/partly_cloudy_day.png"; // Placeholder
        case 51:
        case 53:
        case 55: return "/icons/rain.png"; // Placeholder
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82: return "/icons/rain.png"; // Placeholder
        case 71:
        case 73:
        case 75:
        case 77: return "/icons/snow.png"; // Placeholder
        case 95:
        case 96:
        case 99: return "/icons/thunderstorm.png"; // Placeholder
        default: return "/icons/unknown.png"; // Placeholder
    }
}

// Fetch weather data on page load
getWeather();

// Auto-refresh every 15 minutes (900,000 milliseconds)
setInterval(getWeather, 900000);
