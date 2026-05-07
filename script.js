const latitude = 31.58;
const longitude = 74.33;

// State
let weatherData = null; // Store fetched data
let isCelsius = true;
let isKmh = true;
let forecastDays = 5;
let theme = 'dark';

// DOM Elements
const currentTempEl = document.getElementById('current-temp');
const tempUnitLabel = document.getElementById('temp-unit-label');
const weatherIconEl = document.getElementById('weather-icon');
const weatherDescEl = document.getElementById('weather-desc');
const currentWindEl = document.getElementById('current-wind');
const forecastListEl = document.getElementById('forecast-list');
const liveClockEl = document.getElementById('live-clock');

// Initialization
function init() {
    startClock();
    setupEventListeners();
    getWeather();
    // Auto-refresh every 15 minutes (900,000 milliseconds)
    setInterval(getWeather, 900000);
}

// Clock
function startClock() {
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        liveClockEl.textContent = `${hours}:${minutes} ${ampm}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}

// Toggles and settings
function setupEventListeners() {
    // Temperature Unit
    document.querySelectorAll('#temp-toggle .toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#temp-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            isCelsius = e.target.dataset.val === 'C';
            if (weatherData) updateUI();
        });
    });

    // Forecast Days
    document.querySelectorAll('#days-toggle .toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#days-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            forecastDays = parseInt(e.target.dataset.val);
            if (weatherData) updateUI();
        });
    });

    // Theme
    document.querySelectorAll('#theme-toggle .toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#theme-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            theme = e.target.dataset.val;
            document.body.className = `${theme}-mode`;
        });
    });

    // Wind Speed Unit
    document.querySelectorAll('#wind-toggle .toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#wind-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            isKmh = e.target.dataset.val === 'kmh';
            if (weatherData) updateUI();
        });
    });

    // Refresh Button
    document.getElementById('refresh-btn').addEventListener('click', () => {
        getWeather();
    });
}

// Data Fetching
async function getWeather() {
    try {
        currentTempEl.textContent = '...';

        // Fetch current and daily forecast up to 7 days
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&past_days=0`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        weatherData = await response.json();

        updateUI();

    } catch (error) {
        console.error('Error fetching weather data:', error);
        currentTempEl.textContent = '--';
        weatherDescEl.textContent = 'Failed to load weather';
        weatherIconEl.src = 'https://unpkg.com/lucide-static@latest/icons/alert-circle.svg';
        forecastListEl.innerHTML = '<p>Could not retrieve forecast.</p>';
    }
}

// Data conversion
function cToF(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

function kmhToMph(kmh) {
    return Math.round(kmh * 0.621371);
}

// UI Update
function updateUI() {
    if (!weatherData) return;

    // --- Current Weather ---
    let temp = Math.round(weatherData.current_weather.temperature);
    if (!isCelsius) temp = cToF(temp);

    currentTempEl.textContent = temp;
    tempUnitLabel.textContent = isCelsius ? '°C' : '°F';

    weatherDescEl.textContent = getWeatherDescription(weatherData.current_weather.weathercode);
    weatherIconEl.src = getWeatherIconUrl(weatherData.current_weather.weathercode);

    let windSpeed = Math.round(weatherData.current_weather.windspeed);
    if (!isKmh) windSpeed = kmhToMph(windSpeed);
    currentWindEl.textContent = `Wind: ${windSpeed} ${isKmh ? 'km/h' : 'mph'}`;

    // --- Forecast ---
    forecastListEl.innerHTML = '';
    if (weatherData.daily && weatherData.daily.time) {
        // Only show up to forecastDays
        const daysToShow = Math.min(forecastDays, weatherData.daily.time.length);

        for (let i = 0; i < daysToShow; i++) {
            const dateStr = weatherData.daily.time[i];
            const date = new Date(dateStr);
            // Handle timezone offset simply or just use the local date representation
            let dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            // If it's index 0, it's today
            if (i === 0) dayName = 'Today';

            let maxTempRaw = weatherData.daily.temperature_2m_max[i];
            let minTempRaw = weatherData.daily.temperature_2m_min[i];

            let maxTemp = Math.round(maxTempRaw);
            let minTemp = Math.round(minTempRaw);

            if (!isCelsius) {
                maxTemp = cToF(maxTempRaw);
                minTemp = cToF(minTempRaw);
            }

            const weathercode = weatherData.daily.weathercode[i];
            const iconUrl = getWeatherIconUrl(weathercode);

            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item');
            forecastItem.innerHTML = `
                <div class="day">${dayName}</div>
                <img src="${iconUrl}" alt="Forecast Icon">
                <div class="temp">${maxTemp}° / ${minTemp}°</div>
            `;
            forecastListEl.appendChild(forecastItem);
        }
    }
}

// Weather Code mapping
function getWeatherDescription(weathercode) {
    switch (weathercode) {
        case 0: return "Clear sky";
        case 1: return "Mainly clear";
        case 2: return "Partly cloudy";
        case 3: return "Overcast";
        case 45:
        case 48: return "Fog";
        case 51:
        case 53:
        case 55: return "Drizzle";
        case 56:
        case 57: return "Freezing Drizzle";
        case 61: return "Light rain";
        case 63: return "Moderate rain";
        case 65: return "Heavy rain";
        case 66:
        case 67: return "Freezing Rain";
        case 71:
        case 73:
        case 75: return "Snow fall";
        case 77: return "Snow grains";
        case 80:
        case 81:
        case 82: return "Rain showers";
        case 85:
        case 86: return "Snow showers";
        case 95: return "Thunderstorm";
        case 96:
        case 99: return "Thunderstorm with hail";
        default: return "Unknown weather";
    }
}

function getWeatherIconUrl(weathercode) {
    let iconName = 'cloud'; // Default

    switch (weathercode) {
        case 0: iconName = 'sun'; break;
        case 1:
        case 2: iconName = 'cloud-sun'; break;
        case 3: iconName = 'cloud'; break;
        case 45:
        case 48: iconName = 'wind'; break;
        case 51:
        case 53:
        case 55:
        case 56:
        case 57: iconName = 'cloud-drizzle'; break;
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
        case 80:
        case 81:
        case 82: iconName = 'cloud-rain'; break;
        case 71:
        case 73:
        case 75:
        case 85:
        case 86: iconName = 'cloud-snow'; break;
        case 77: iconName = 'snowflake'; break;
        case 95:
        case 96:
        case 99: iconName = 'cloud-lightning'; break;
        default: iconName = 'cloud';
    }

    return `https://unpkg.com/lucide-static@latest/icons/${iconName}.svg`;
}

// Start
init();