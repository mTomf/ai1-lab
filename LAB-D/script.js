document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const container = document.getElementById('weather-container');
    const forecastContainer = document.getElementById('forecast-container');

    const ui = {
        city: document.getElementById('city-name'),
        desc: document.getElementById('today-desc'),
        temp: document.getElementById('today-temp'),
        max: document.getElementById('max-temp'),
        min: document.getElementById('min-temp'),
        wind: document.getElementById('wind-speed'),
        humidity: document.getElementById('humidity')
    };

    const apiKey = 'ce23f8391ef328b9dc487b0e5d717bf1';

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const city = cityInput.value.trim();
        if (city) {
            getCurrentWeatherXHR(city);
            getForecastFetch(city);
            container.classList.add('active');
        }
    });

    function getCurrentWeatherXHR(city) {
        const xhr = new XMLHttpRequest();
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pl`;

        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (this.status === 200) {
                const data = JSON.parse(this.responseText);
                console.log(data);
                updateCurrentUI(data);
            } else if (this.status === 404) {
                ui.city.textContent = "Nie znaleziono";
            }
        };
        xhr.onerror = function() {
            console.error("Błąd połączenia XHR");
        };
        xhr.send();
    }

    function getForecastFetch(city) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=pl`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Błąd sieci lub nie znaleziono miasta');
                }
                return response.json();
            })
            .then(data => {
                processForecastData(data.list);
                console.log(data);
            })
            .catch(error => {
                console.error('Wystąpił błąd Fetch:', error);
            });
    }

    function updateCurrentUI(data) {
        ui.city.textContent = data.name;
        ui.desc.textContent = data.weather[0].description;
        ui.temp.textContent = Math.round(data.main.temp) + '°';

        ui.max.textContent = Math.round(data.main.temp_max) + '°';
        ui.min.textContent = Math.round(data.main.temp_min) + '°';
        ui.wind.textContent = Math.round(data.wind.speed * 3.6) + ' km/h';
        ui.humidity.textContent = data.main.humidity + '%';
    }

    function processForecastData(list) {
        forecastContainer.innerHTML = '';

        let daysCount = 0;
        const todayString = new Date().toDateString();

        for (let i = 0; i < list.length; i++) {
            const reading = list[i];

            if (reading.dt_txt.includes("12:00:00")) {

                const readingDate = new Date(reading.dt * 1000);

                if (readingDate.toDateString() === todayString) {
                    continue;
                }

                let nightTemp;

                if (i + 5 < list.length) {
                    nightTemp = Math.round(list[i + 5].main.temp);
                } else {
                    nightTemp = Math.round(reading.main.temp_min - 2);
                }

                createForecastTile(reading, nightTemp);
                daysCount++;

                if (daysCount === 5) break;
            }
        }
    }

    function createForecastTile(dayData, nightTemp) {
        const dateObj = new Date(dayData.dt * 1000);
        const dateString = dateObj.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' });

        const tempDay = Math.round(dayData.main.temp);
        const iconEmoji = getWeatherEmoji(dayData.weather[0].icon);

        const tile = document.createElement('div');
        tile.className = 'forecast-tile';
        tile.innerHTML = `
            <p class="date">${dateString}</p>
            <div class="icon">${iconEmoji}</div>
            <p class="temp">${tempDay}° / <span style="opacity: 0.6">${nightTemp}°</span></p>
        `;
        forecastContainer.appendChild(tile);
    }

    function getWeatherEmoji(iconCode) {
        const map = {
            '01d': '☀️', '01n': '🌑',
            '02d': '🌤️', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '🌩️', '11n': '🌩️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return map[iconCode] || '❓';
    }
});
