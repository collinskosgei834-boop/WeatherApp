// ==========================
// Weather App
// Collins Kosgei
// ==========================

// Elements
const lastUpdated = document.getElementById("lastUpdated");
const forecastContainer = document.getElementById("forecastContainer");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const city = document.getElementById("city");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const loading = document.getElementById("loading");
const weatherResult = document.getElementById("weatherResult");

// Event Listeners
searchBtn.addEventListener("click", getWeather);

locationBtn.addEventListener("click", getCurrentLocation);

cityInput.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {

        getWeather();

    }

});

// ==========================
// Search Weather by City
// ==========================

async function getWeather() {

    const cityName = cityInput.value.trim();

    if (cityName === "") {
message.style.display = "block";
        showMessage("Please enter a city.", "error");

        return;

    }

    loading.style.display = "block";
    weatherResult.style.display = "none";

    try {

        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`
        );

        const geoData = await geoResponse.json();

        if (!geoData.results) {

            loading.style.display = "none";
           showMessage("City not found.", "error");
            return;

        }

        const place = geoData.results[0];
saveRecentSearch(place.name);
        getWeatherByCoordinates(
            place.latitude,
            place.longitude,
            place.name,
            place.country
        );

    }

    catch (error) {

        loading.style.display = "none";
        weatherResult.style.display = "block";

        alert("Unable to retrieve weather.");

        console.error(error);

    }

}

// ==========================
// Use Current Location
// ==========================

function getCurrentLocation() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported by your browser.");

        return;

    }

    loading.style.display = "block";
    weatherResult.style.display = "none";

    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            getWeatherByCoordinates(
                latitude,
                longitude,
                "Your Location",
                ""
            );

        },

        function() {

            loading.style.display = "none";
            weatherResult.style.display = "block";

            alert("Location access denied.");

        }

    );

}

// ==========================
// Weather by Coordinates
// ==========================

async function getWeatherByCoordinates(latitude, longitude, cityName, countryName) {

    try {

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5`
        );

        const weatherData = await weatherResponse.json();

        city.textContent = `${cityName} ${countryName}`;

        temperature.textContent =
            `${weatherData.current.temperature_2m} °C`;

        humidity.textContent =
            `${weatherData.current.relative_humidity_2m} %`;

        wind.textContent =
            `${weatherData.current.wind_speed_10m} km/h`;

        condition.textContent =
    getWeatherIcon(weatherData.current.weather_code) +
    " " +
    weatherCodeToText(weatherData.current.weather_code);
    const now = new Date();

lastUpdated.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
});

updateBackground(weatherData.current.weather_code);
displayForecast(weatherData.daily);
showMessage("Weather updated successfully!", "success");
loading.style.display = "none";
weatherResult.style.display = "block";

    }

    catch (error) {

        loading.style.display = "none";
        weatherResult.style.display = "block";

        alert("Unable to retrieve weather.");

        console.error(error);

    }

}

// ==========================
// Weather Icons
// ==========================

function getWeatherIcon(code) {

    if (code === 0) return "☀️";
    if ([1,2,3].includes(code)) return "⛅";
    if ([45,48].includes(code)) return "🌫️";
    if ([51,53,55].includes(code)) return "🌦️";
    if ([61,63,65].includes(code)) return "🌧️";
    if ([71,73,75].includes(code)) return "❄️";
    if ([80,81,82].includes(code)) return "🌦️";
    if (code === 95) return "⛈️";

    return "🌍";

}

// ==========================
// Weather Descriptions
// ==========================

function weatherCodeToText(code) {

    switch (code) {

        case 0:
            return "Clear Sky";

        case 1:
        case 2:
        case 3:
            return "Partly Cloudy";

        case 45:
        case 48:
            return "Fog";

        case 51:
        case 53:
        case 55:
            return "Drizzle";

        case 61:
        case 63:
        case 65:
            return "Rain";

        case 71:
        case 73:
        case 75:
            return "Snow";

        case 80:
        case 81:
        case 82:
            return "Rain Showers";

        case 95:
            return "Thunderstorm";

        default:
            return "Unknown";

    }

}// ==========================
// Dynamic Background
// ==========================

function updateBackground(code){

    if(code === 0){

        document.body.style.background =
            "linear-gradient(135deg,#f6d365,#fda085)";

    }

    else if([1,2,3].includes(code)){

        document.body.style.background =
            "linear-gradient(135deg,#89f7fe,#66a6ff)";

    }

    else if([45,48].includes(code)){

        document.body.style.background =
            "linear-gradient(135deg,#757f9a,#d7dde8)";

    }

    else if([51,53,55,61,63,65,80,81,82].includes(code)){

        document.body.style.background =
            "linear-gradient(135deg,#4b79a1,#283e51)";

    }

    else if([71,73,75].includes(code)){

        document.body.style.background =
            "linear-gradient(135deg,#e6dada,#274046)";

    }

    else if(code === 95){

        document.body.style.background =
            "linear-gradient(135deg,#232526,#414345)";

    }

    else{

        document.body.style.background =
            "linear-gradient(135deg,#4facfe,#00f2fe)";

    }

}// ==========================
// Recent Searches
// ==========================

const recentSearches = document.getElementById("recentSearches");

function saveRecentSearch(cityName){

    let searches = JSON.parse(localStorage.getItem("recentCities")) || [];

    searches = searches.filter(city => city !== cityName);

    searches.unshift(cityName);

    if(searches.length > 5){

        searches.pop();

    }

    localStorage.setItem("recentCities", JSON.stringify(searches));

    displayRecentSearches();

}

function displayRecentSearches(){

    const searches = JSON.parse(localStorage.getItem("recentCities")) || [];

    recentSearches.innerHTML = "";

    searches.forEach(cityName => {

        const li = document.createElement("li");

        li.textContent = cityName;

        li.addEventListener("click", () => {

            cityInput.value = cityName;

            getWeather();

        });

        recentSearches.appendChild(li);

    });

}displayRecentSearches();const message = document.getElementById("message");

function showMessage(text, type){

    message.textContent = text;

    message.className = type;

}// ==========================
// Display Forecast
// ==========================

function displayForecast(daily){

    forecastContainer.innerHTML = "";

    for(let i = 0; i < daily.time.length; i++){

        const date = new Date(daily.time[i]);

        const day = date.toLocaleDateString("en-US",{
            weekday:"short"
        });

        const icon = getWeatherIcon(daily.weather_code[i]);

        forecastContainer.innerHTML += `

        <div class="forecast-card">

            <h4>${day}</h4>

            <p style="font-size:30px;">
                ${icon}
            </p>

            <p>${daily.temperature_2m_max[i]}° / ${daily.temperature_2m_min[i]}°</p>

        </div>

        `;

    }

}