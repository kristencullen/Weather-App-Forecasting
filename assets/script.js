const apiKey = '70fcdbb2708aa33cafb1ed114f4fd992';  // Your actual API key

const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const searchHistory = document.getElementById('search-history');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
        saveSearchHistory(city);
        cityInput.value = '';
    }
});

function fetchWeather(city) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                return fetch(weatherUrl);
            } else {
                throw new Error('City not found');
            }
        })
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data. Check console for details.');
        });
}

function displayCurrentWeather(data) {
    const weather = data.list[0];
    currentWeather.innerHTML = `
        <div class="weather-card">
            <h2>${data.city.name}</h2>
            <p>Date: ${new Date(weather.dt * 1000).toLocaleDateString()}</p>
            <img src="http://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="${weather.weather[0].description}">
            <p>Temperature: ${weather.main.temp} °C</p>
            <p>Humidity: ${weather.main.humidity}%</p>
            <p>Wind Speed: ${weather.wind.speed} m/s</p>
        </div>
    `;
}

function displayForecast(data) {
    forecast.innerHTML = '';
    for (let i = 1; i < data.list.length; i += 8) {
        const weather = data.list[i];
        forecast.innerHTML += `
            <div class="weather-card">
                <p>Date: ${new Date(weather.dt * 1000).toLocaleDateString()}</p>
                <img src="http://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="${weather.weather[0].description}">
                <p>Temperature: ${weather.main.temp} °C</p>
                <p>Humidity: ${weather.main.humidity}%</p>
                <p>Wind Speed: ${weather.wind.speed} m/s</p>
            </div>
        `;
    }
}

function saveSearchHistory(city) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        updateSearchHistory();
    }
}

function updateSearchHistory() {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistory.innerHTML = '';
    history.forEach(city => {
        const cityBtn = document.createElement('button');
        cityBtn.textContent = city;
        cityBtn.addEventListener('click', () => fetchWeather(city));
        searchHistory.appendChild(cityBtn);
    });
}

// Initialize search history on page load
updateSearchHistory();
