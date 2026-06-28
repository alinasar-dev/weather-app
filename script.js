const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-button');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

searchBtn.addEventListener('click', () => {
    //If string is not empty
    if (cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
})

cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
})

const apiKey = '1b5f63ac8888af1fba79c6441ea8665d';

async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    
    const response = await fetch(apiUrl);
    return response.json();
}

function getCurrentDate() {
    const currentdate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }
    return currentdate.toLocaleDateString('en-GB', options);
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id <= 800) return 'clear.svg';
    else return 'clouds.svg'
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);
    
    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection);
        return;
    }
    // console.log(weatherData);

    const {
        name: country,
        main: { temp, humidity},
        weather: [{ id, main }],
        wind: {speed}

    } = weatherData;

    document.querySelector('.country-txt').textContent = country;
    document.querySelector('.temp-txt').textContent = Math.round(temp) + '°C';
    document.querySelector('.condition-txt').textContent = main;
    document.querySelector('.humidity-value-txt').textContent = humidity + '%';
    document.querySelector('.wind-value-txt').textContent = speed + ' m/s';

    document.querySelector('.current-date-txt').textContent = getCurrentDate();
    document.querySelector('.weather-summary-img').src = `assets/weather/${getWeatherIcon(id)}`;

    // Update forecast details (Predicted upcoming weather)
    await updateForecastInfo(city);

    showDisplaySection(weatherInfoSection);
}

async function updateForecastInfo(city) {
    const forecastData = await getFetchData('forecast', city);

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    document.querySelector('.forecast-items-container').innerHTML = '';

    forecastData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) &&
            !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather);
        }
    })
}

function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{id}],
        main: {temp}
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = {
        day: '2-digit',
        month: 'short'
    }
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `
    document.querySelector('.forecast-items-container')
        .insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(section => section.style.display = 'none')

    section.style.display = 'flex';
}