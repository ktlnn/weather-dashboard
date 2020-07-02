var apikey = "20429f05beb7b7ddca41ce6d64ba493b";
var cityName = "New York City";
var imperialUnits = "&units=imperial";
var metricUnits = "&units-metric";

var windDirection = "";
var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apikey;

var weatherIconURL = "https://openweathermap.org/img/w/";

var today = moment().format("dddd LL");
$("#today").text(today);

$.ajax({
  url: queryURL,
  method: "GET",
}).then(function (response) {
  console.log(response);
  // based on city, get lat and lon to be used for OWM One Call API
  $("#city").text(response.name + ", " + response.sys.country);
  oneCall(response.coord.lat, response.coord.lon);
});

function oneCall(lat, lon) {
  let oneCallQueryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}${imperialUnits}&exclude=minutely,hourly&appid=${apikey}`;

  $.ajax({
    url: oneCallQueryURL,
    method: "GET",
  }).then(function (response) {
    // console.log(queryURL);
    console.log(response);
    $("#current-temp").text(response.current.temp.toFixed(0) + "\xB0F");
    $("#today-high-temp").text("High " + response.daily[0].temp.max.toFixed(0) + "\xB0F");
    $("#today-low-temp").text("Low " + response.daily[0].temp.min.toFixed(0) + "\xB0F");    
    $("#current-weather").text(response.current.weather[0].main);
    weatherIconURL += response.current.weather[0].icon + ".png";
    // console.log(weatherIconURL);
    $("#current-icon").attr("src", weatherIconURL);
    $("#current-humidity").text(response.current.humidity + "% RH");
    getDirection(response.current.wind_deg);
    // console.log(response.wind.deg);
    // console.log(windDirection);
    $("#current-wind").text(windDirection + response.current.wind_speed + " mph");
    $("#current-uv").text(response.current.uvi + " UV Index");

    getForecast(response);
  });
}

function getForecast(response) {
  
  for (let i = 1; i < 6; i++){
    let day = moment().add(i, 'd').format('dddd');
    console.log(day);
    $("#" + i + ">.day").text(day);
    $("#" + i + ">.high-temp").text(response.daily[i].temp.max.toFixed(0) + "\xB0F");
    $("#" + i + ">.low-temp").text(response.daily[i].temp.min.toFixed(0) + "\xB0F");
    $("#" + i + ">.weather").text(response.daily[i].weather[0].main);
    $("#" + i + ">.weather-icon").attr("src", "https://openweathermap.org/img/w/"+ response.daily[i].weather[0].icon + ".png");
    $("#" + i + ">.humidity").text(response.daily[i].humidity + "% RH");
  }
}

function getDirection(degrees) {
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
}
