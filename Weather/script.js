const apiKey = '0370f8fe96526098821530db09713e19';
let isCelsius = true;
let currentTempCelsius = null;
let forecastDataCelsius = [];
const autoSuggest = document.getElementById("autoSuggest");
const currentWeatherSection = document.getElementById("current-weather-section");
const forecastSection = document.getElementById("forecast-section");
const loadingSpinner = document.getElementById("loading-spinner");
const content = document.querySelector(".content");

function showLoading() {
	content.style.display = "none";
	loadingSpinner.classList.remove("hidden");
}

function hideLoading() {
	content.style.display = "flex";
	loadingSpinner.classList.add("hidden");
}


async function getWeatherByCity(cityName) {
	clearSuggest();
	showLoading();
	try {
		const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`);
		const geoData = await geoResponse.json();

		if (geoData.length === 0) {
			alert("City not found. Please try again.");
			hideLoading();
			return;
		}

		const { lat, lon } = geoData[0];
		await getWeatherData(lat, lon, cityName);
	} catch (error) {
		console.error("Error fetching city coordinates:", error);
	} finally {
		hideLoading();
	}
}

async function getWeatherData(lat, lon, locationName) {
	showLoading();
	try {
		const weatherResponse = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`);
		const weatherData = await weatherResponse.json();

		currentTempCelsius = weatherData.current.temp;
		forecastDataCelsius = weatherData.daily.slice(0, 5);

		currentWeatherSection.classList.remove("hidden");
		forecastSection.classList.remove("hidden");

		displayCurrentWeather(weatherData.current, locationName);
		displayForecast(forecastDataCelsius);
	} catch (error) {
		console.error("Error fetching weather data:", error);
	} finally {
		hideLoading();
	}
}

// Остальные функции без изменений

const locationName = document.getElementById("location-name");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const weatherDescription = document.getElementById("weather-description");
const weatherIcon = document.getElementById("weather-icon");

function displayCurrentWeather(currentWeather, locationNameParam) {
	locationName.textContent = locationNameParam;
	updateTemperatureDisplay(currentTempCelsius);
	humidity.textContent = `Humidity: ${currentWeather.humidity}%`;
	windSpeed.textContent = `Wind Speed: ${currentWeather.wind_speed} m/s`;
	weatherDescription.textContent = currentWeather.weather[0].description;
	weatherIcon.src = `http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png`;
}

function displayForecast(forecastData) {
	const forecastContainer = document.getElementById("forecast-container");
	forecastContainer.innerHTML = '';

	forecastData.forEach(day => {
		const forecastCard = document.createElement("div");
		forecastCard.classList.add("forecast-card");

		const date = new Date(day.dt * 1000).toLocaleDateString();
		const temp = isCelsius ? `${day.temp.day}°C` : `${convertToFahrenheit(day.temp.day)}°F`;
		const weather = day.weather[0].description;
		const icon = day.weather[0].icon;

		forecastCard.innerHTML = `
			<p class="date">${date}</p>
			<img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon" class="weather-icon">
			<p class="description">${weather}</p>
			<p class="temp">${temp}</p>
		`;
		forecastContainer.appendChild(forecastCard);
	});
}

function updateTemperatureDisplay(tempCelsius) {
	const tempElement = document.getElementById("temperature");
	tempElement.textContent = isCelsius ? `${tempCelsius}°C` : `${convertToFahrenheit(tempCelsius).toFixed(1)}°F`;
}

function convertToFahrenheit(celsius) {
	return (celsius * 9/5) + 32;
}

document.getElementById("toggle-unit").addEventListener("click", () => {
	isCelsius = !isCelsius;
	updateTemperatureDisplay(currentTempCelsius);
	displayForecast(forecastDataCelsius);
});

function getWeatherByLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			position => {
				const { latitude, longitude } = position.coords;
				getWeatherData(latitude, longitude, "Your Location");
			},
			error => {
				alert("Unable to retrieve your location.");
				console.error("Geolocation error:", error);
			}
		);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}

document.querySelector(".search-btn").addEventListener("click", () => {
	const cityName = document.getElementById("city-search").value.trim();
	if (cityName) {
		getWeatherByCity(cityName);
	} else {
		alert("Please enter a city name.");
	}
});

document.getElementById("location-btn").addEventListener("click", getWeatherByLocation);

function debounce(fn, delay) {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

async function fetchCitySuggestions(query) {
	if (query) {
		try {
			const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`);
			const cities = await response.json();
			autoSuggest.innerHTML = cities
				.map(city => `<li onclick="selectCity('${city.name}')">${city.name}, ${city.country}</li>`)
				.join('');
		} catch (error) {
			console.error("Error fetching city suggestions:", error);
		}
	}
}

async function selectCity(cityName) {
	document.getElementById("city-search").value = cityName;
	await getWeatherByCity(cityName);
	clearSuggest();
}

function clearSuggest() {
	autoSuggest.innerHTML = '';
}

const debouncedFetchCitySuggestions = debounce(fetchCitySuggestions, 300);
document.getElementById("city-search").addEventListener("input", (e) => {
	debouncedFetchCitySuggestions(e.target.value);
});
