const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
const city = 'Lahore';
const country = 'Pakistan';

const currentTempEl = document.getElementById('current-temp');
const weatherIconEl = document.getElementById('weather-icon');
const weatherDescEl = document.getElementById('weather-desc');
const forecastListEl = document.getElementById('forecast-list');

async function getWeather() {
    try {
        // Fetch current weather
        const currentWeatherUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city},${country}&aqi=no`;
        const currentResponse = await fetch(currentWeatherUrl);
        if (!currentResponse.ok) {
            throw new Error(`HTTP error! status: ${currentResponse.status}`);
        }
        const currentData = await currentResponse.json();

        // Fetch forecast weather
        const forecastUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city},${country}&days=5&aqi=no&alerts=no`;
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            throw new Error(`HTTP error! status: ${forecastResponse.status}`);
        }
        const forecastData = await forecastResponse.json();

        updateUI(currentData, forecastData);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Display error to user if necessary
        currentTempEl.textContent = '--';
        weatherDescEl.textContent = 'Failed to load weather';
        weatherIconEl.src = '';
        forecastListEl.innerHTML = '<p>Could not retrieve forecast.</p>';
    }
}

function updateUI(currentData, forecastData) {
    // Update current weather
    currentTempEl.textContent = currentData.current.temp_c;
    weatherDescEl.textContent = currentData.current.condition.text;
    weatherIconEl.src = 'https:' + currentData.current.condition.icon;

    // Update forecast
    forecastListEl.innerHTML = ''; // Clear previous forecast
    forecastData.forecast.forecastday.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', {
            weekday: 'short'
        });
        const maxTemp = day.day.maxtemp_c;
        const minTemp = day.day.mintemp_c;
        const icon = 'https:' + day.day.condition.icon;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <div class="day">${dayName}</div>
            <img src="${icon}" alt="Forecast Icon">
            <div class="temp">${maxTemp}° / ${minTemp}°</div>
        `;
        forecastListEl.appendChild(forecastItem);
    });
}

// Fetch weather data on page load
getWeather();

// Auto-refresh every 15 minutes (900,000 milliseconds)
setInterval(getWeather, 900000);
