/* Global Variables */
const API_KEY = "3fb8cfbb44d01f60fd088bd49d4b55a2";
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?`;
const GEOCODING_API_URL = "http://api.openweathermap.org/geo/1.0/reverse?";

const formButton = document.getElementById("generate");
const zipInput = document.getElementById("zip");

/* Fetches the data and transform JSON to js */
async function fetchData(
  url,
  options = { method, credentials, headers, body }
) {
  const response = await fetch(url, options);
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

/* Get current location necessary for getting country data */
function getLocation() {
  /* Return a promise for getting the position */
  return new Promise((resolve, reject) => {
    /* Store position */
    const locData = {};
    /* Get the position and assign it to "locData" object */
    navigator.geolocation.getCurrentPosition((pos) => {
      locData.lat = pos.coords.latitude;
      locData.lon = pos.coords.longitude;
      /* Resolve promise with object containing the position */
      resolve(locData);
    });
  });
}

/* Get country data from "geocoding" API */
async function getCountryData(url, key, locationData) {
  try {
    /* Destructure Location object from parameter
      to get the latitude and longitude */
    const { lat, lon } = await locationData;
    /* Get country data by API_URL, latitude, longitude and API_KEY */
    const [data] = await fetchData(
      `${url}lat=${lat}&lon=${lon}&appid=${key}`,
      null
    );
    return data;
  } catch (error) {
    console.error(error);
  }
}

/* Get weather data from "openweathermap" API*/
async function getWeatherData(zip, url, key, locationData) {
  try {
    /* Make a call to "geocoding" API to the location
      necessary for "openweathermap" API url */
    const countryData = await getCountryData(
      GEOCODING_API_URL,
      key,
      locationData
    );

    /* Get weather data from API by zip-code,
       API_KEY and country name */
    const data = await fetchData(
      `${url}q=${countryData.state},zip=${zip},${countryData.country}&appid=${key}&units=imperial`,
      null
    );
    if (data.cod === "404") throw new Error(data.message);
    return data;
  } catch (error) {
    console.error(error);
  }
}

/* Get the data from the server and 
  render the received data in the DOM */
async function getData(url = "") {
  try {
    /* Make a GET request to the server for the data,
      Destructure Data object */
    const { entries: data } = await fetchData(url, {
      method: "GET",
      credentials: "same-origin",
    });
    /* Render received data */
    renderEntry(data);
  } catch (error) {
    console.error(error.message);
  }
}

/* Post data to the server */
async function postData(url = "", data) {
  /* Get the data before making a fetch call to the server */
  const reqData = await data;
  console.log(reqData);
  /* Make a post request to the server with data attached */
  const request = await fetchData(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqData),
  });
}

/* Render entry element from received data */
function renderEntry(data) {
  /* Local variables */
  const entryContainer = document.getElementById("entry");
  /* Temporary container to hold the entries,
    To enhance preformance. */
  let tempHtml = document.createDocumentFragment();
  /* Loop over entries that are received from the server
    while appending Dynamic Html template */
  data.forEach((entry, i) => {
    tempHtml.append(`
    <div id="entryHolder" data-entry="${entry.entryId}">
      <div id="date">${entry.entryDate}</div>
      <div id="temp">${Math.round(entry.main.temp)} degrees</div>
      <div id="content">${entry.main.feels_like}</div>
    </div>`);
  });
  /* Get the final Html text */
  const finalHtml = tempHtml.textContent;
  /* Insert the Entry element after the first child
    of the parent element "entry" */
  entryContainer;
  return entryContainer.insertAdjacentHTML("beforeend", finalHtml);
}

/* Handle clicks of "generate" button */
async function formButtonHandler() {
  /* Get zip code for input-field */
  const zipCode = zipInput.value;
  if (!zipCode) throw new Error("Zip code is invalid or empty");
  try {
    /* Post data to the server */
    /* Get weather data from "openweathermap" API */
    postData(
      "/all",
      getWeatherData(zipCode, WEATHER_API_URL, API_KEY, getLocation())
    );
    /* Check for location permission before getting the data
    from the server */
    const permResult = await navigator.permissions.query({
      name: "geolocation",
    });
    if (permResult.state === "granted" || permResult.state === "prompt") {
      setTimeout(() => getData("/all"), 2000);
    }
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

formButton.addEventListener("click", formButtonHandler);
