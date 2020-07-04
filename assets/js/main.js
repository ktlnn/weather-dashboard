// Global variables
var apikey = "20429f05beb7b7ddca41ce6d64ba493b";
var cities; // an array

$(document).ready(function () {
  // setup cities array based on whether if it was previously stored or not. If not previously stored push a defaultCity into the array
  getSavedCities();
  // display weather of last city in cities array using City ID query
  displayWeather(`id=${cities[cities.length - 1].id}`);

  // click event to add a city, display weather of tht city and save that city
  $("#button").on("click", function (event) {
    event.preventDefault();
    // query using City Name 
    let cityName = 'q=' + $("#city-input").val();
    displayWeather(cityName);
  });

  // click event to display weather from list of previously saved cities
  $("#city-list").on("click", "li", function (event) {
    let cityID = 'id=' + $(event.target).attr("id");
    // console.log("li click");
    displayWeather(cityID);
  });

  // click event to delete city rom the cities array when the delete button is clicked
  $('#city-list').on("click", "span", function (event) {
    event.stopPropagation();
    // console.log("del click");
    // console.log(event.target);
    let cityID = $(event.target).parent().attr("id");
    // console.log(cityID);
    let j = cities.findIndex(function (thisCity) {
      return thisCity.id === cityID;
     });
    cities.splice(j, 1);
    localStorage.setItem("cities", JSON.stringify(cities));
    refreshCityList();
  });

});

// ajax GET request to OWM Current Weather API based on city name
function displayWeather(cityParam) {
  // display today's date using moment.js API
  let today = moment().format("dddd LL");
  $("#today").text(today);

  let queryURL = "https://api.openweathermap.org/data/2.5/weather?" + cityParam + "&appid=" + apikey;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    // if response is valid, store city name and country
    storeCityName(response.name, response.sys.country, response.id);
    // based on city, get lat and lon to be used for OWM One Call API (which does not support city names)
    $("#city").text(response.name + ", " + response.sys.country);
    oneCall(response.coord.lat, response.coord.lon);
  }, function () {  // alert if Promise is rejected
    alert("City not found"); 
  });
}

// ajax 'GET' request to OWM OneCall API
function oneCall(lat, lon) {
  let units = "&units=imperial";
  let oneCallQueryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}${units}&exclude=minutely,hourly&appid=${apikey}`;
  let weatherIconURL = "https://openweathermap.org/img/w/";
  let backgroundImgURL = 'linear-gradient(rgba(128,128,128,0.25),rgba(128,128,128,0.25)), url("./assets/img/';
  
  $.ajax({
    url: oneCallQueryURL,
    method: "GET",
  }).then(function (response) {
    // generate HTML from response
    $("#current-temp").text(response.current.temp.toFixed(0) + "\xB0F");
    $("#today-high-temp").text("High " + response.daily[0].temp.max.toFixed(0) + "\xB0F");
    $("#today-low-temp").text("Low " + response.daily[0].temp.min.toFixed(0) + "\xB0F");
    backgroundImgURL += response.current.weather[0].main.toLowerCase()+'.jpg")';
    // console.log(backgroundImgURL);
    $("#current-weather").text(response.current.weather[0].main);
    $('.card').css("background-image", backgroundImgURL);
    // console.log($('.card').css("background-image"));
    weatherIconURL += response.current.weather[0].icon + ".png";
    $("#current-icon").attr("src", weatherIconURL);
    $("#current-humidity").text("Humidity " + response.current.humidity + "% RH");
    let direction = getWindDirectionString(response.current.wind_deg);
    $("#current-wind").text(direction + " Wind " + response.current.wind_speed + " mph");
    $("#current-uv").text(" UV Index " + response.current.uvi);

    if (response.current.uvi < 3) {
      $('#current-uv').attr("class", "uv-low");
    } else if (response.current.uvi >= 3 && response.current.uvi <8) {
      $('#current-uv').attr("class", "uv-mid");
    } else if (response.current.uvi >= 8) {
      $('#current-uv').attr("class", "uv-high");
    }

    getForecast(response);
  });
}

// generate HTML for 5 day forecast 
function getForecast(response) {
  for (let i = 1; i < 6; i++) {
    let day = moment().add(i, "d").format("dddd");
    $("#" + i + ">.day").text(day);
    $("#" + i + ">.high-temp").text("High " + response.daily[i].temp.max.toFixed(0) + "\xB0F");
    $("#" + i + ">.low-temp").text("Low " + response.daily[i].temp.min.toFixed(0) + "\xB0F");
    $("#" + i + ">div>.weather").text(response.daily[i].weather[0].main);
    $("#" + i + ">div>.weather-icon").attr("src", "https://openweathermap.org/img/w/" + response.daily[i].weather[0].icon + ".png");
    $("#" + i + ">.humidity").text("Humidity " + response.daily[i].humidity + "% RH");
  }
}

// convert ajax 'GET' response object's wind.deg to cardinal directions
function getWindDirectionString(degrees) {
  let windDirection = "";
  switch (true) {
    case degrees >= 348.75 || degrees < 11.25:
      windDirection = "N ";
      break;
    case degrees >= 11.25 && degrees < 33.75:
      windDirection = "NNE ";
      break;
    case degrees >= 33.75 && degrees < 56.25:
      windDirection = "NE ";
      break;
    case degrees >= 56.25 && degrees < 78.75:
      windDirection = "ENE ";
      break;
    case degrees >= 78.75 && degrees < 101.25:
      windDirection = "E ";
      break;
    case degrees >= 101.25 && degrees < 123.75:
      windDirection = "ESE ";
      break;
    case degrees >= 123.75 && degrees < 146.25:
      windDirection = "SE ";
      break;
    case degrees >= 146.25 && degrees < 168.75:
      windDirection = "SSE ";
      break;
    case degrees >= 168.75 && degrees < 191.25:
      windDirection = "S ";
      break;
    case degrees >= 191.25 && degrees < 213.75:
      windDirection = "SSW ";
      break;
    case degrees >= 213.75 && degrees < 236.25:
      windDirection = "SW ";
      break;
    case degrees >= 236.25 && degrees < 258.75:
      windDirection = "WSW ";
      break;
    case degrees >= 258.75 && degrees < 281.25:
      windDirection = "W ";
      break;
    case degrees >= 281.25 && degrees < 303.75:
      windDirection = "WNW ";
      break;
    case degrees >= 303.75 && degrees < 326.25:
      windDirection = "NW ";
      break;
    case degrees >= 326.25 && degrees < 348.75:
      windDirection = "NNW ";
      break;
    default:
      windDirection = "no value found";
  }
  return windDirection;
}

// store city into localStorage
function storeCityName(cityName, countryName, cityID) {
  let city = { name: cityName, country: countryName, id: cityID };

  // if city object does not exist in the cities array, then push it. Else do nothing.
  let j = cities.findIndex(function (thisCity) {
    return thisCity.id === cityID;
  });
  if (j < 0) {
    cities.push(city);
    localStorage.setItem("cities", JSON.stringify(cities));
  }
  refreshCityList();
}

// determine if cities array has been previously stored or not
function getSavedCities() {
  const defaultCity = { name: "Bujumbura", country: "BI", id: 425378 };
  // if localStorage has no record of cities, add create cities array with defaultCity as first entry
  if (localStorage.getItem("cities") === null) {
    cities = [defaultCity];
  } else if (cities === undefined) {
  // if i delete all the entries in the cities array, it becomes undefined. I will need to redeclare the cities array.
    cities = [defaultCity];
  } else {
  // if localStorage is not empty, get stored cities array
    cities = JSON.parse(localStorage.getItem("cities"));
  }
}

function refreshCityList() {
  // refresh #city-list UL entries
  $("#city-list").empty();
  for (let i = 0; i < cities.length; i++) {
    $("#city-list").prepend(`<li id="${cities[i].id}">${cities[i].name}, ${cities[i].country}</li>`);
    $(`#${cities[i].id}`).prepend('<span id="span'+i+'" class="delete-btn">&#x2421</span>');
  }
}
