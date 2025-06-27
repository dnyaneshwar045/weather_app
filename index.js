const userTab = document.querySelector("[data-useWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");  

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector(".form-container");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorContainer = document.querySelector(".error-container");

// initial variable
let currentTab = userTab;
const API_KEY="5e159adb5b36e3bf6169fc0fa82e047b";
currentTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(clickedTab) {
    if (clickedTab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        // Hide all containers
        errorContainer.classList.remove("active");
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        searchForm.classList.remove("active");

        // Show the correct container
        if (currentTab === userTab) {
            getfromSessionStorage();
        } else {
            searchForm.classList.add("active");
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

// Check if coordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    errorContainer.classList.remove("active");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        if (data.cod === "404") {
            errorContainer.classList.add("active");
            return;
        }
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        errorContainer.classList.add("active");
    }
}

function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    cityName.innerText = weatherInfo.name;

    const countryIcon = document.querySelector("[data-countryIcon]");
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;

    const desc = document.querySelector("[data-weatherDesc]");
    desc.innerText = weatherInfo?.weather?.[0]?.description;

    const weatherIcon = document.querySelector("[data-weatherIcon]");
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;

    const temp = document.querySelector("[data-temp]");
    temp.innerText = `${weatherInfo?.main?.temp}°C`;

    const windspeed = document.querySelector("[data-windSpeed]");
    windspeed.innerText =`${weatherInfo?.wind?.speed}m/s`;

    const humidity = document.querySelector("[data-humidity]");
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;

    const cloudiness = document.querySelector("[data-cloudiness]");
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value.trim();
    if (cityName === "") {
        return;
    }
    fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorContainer.classList.remove("active");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        if (data.cod === "404") {
            errorContainer.classList.add("active");
            return;
        }
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingScreen.classList.remove("active");
        errorContainer.classList.add("active");
    }   
}