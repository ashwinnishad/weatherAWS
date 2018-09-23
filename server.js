const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const apiKey = ''; // Get API key from OpenWeather
const key = ''; // Get API Key from Google Geocoding API
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/', (req, res) => {
  let address = encodeURIComponent(req.body.address);
  var geocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address +'&key' + key;
  request({url: geocodeURL,
    json: true
  }, (err, response, body) => {
    if(err) {
      res.render('index', {error:'Error, please try again.'});
    } else if(body.status === 'ZERO_RESULTS') {
      res.render('index', {error: 'Unable to find address.'})
    }
    else if(body.status === 'OK') {
    var lat = body.results[0].geometry.location.lat;
    var lng = body.results[0].geometry.location.lng;
    var formatted_address = body.results[0].formatted_address;
    var weatherURL = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lng + '&units=imperial' + '&appid=' + apiKey
      request(weatherURL, (err, response, body) => {
        if(err) {
          res.render('index', {weather: null, error: 'Error, please try again'});
        }
        else {
          let weather = JSON.parse(body);
          if(weather.main == undefined) {
            res.render('index', {weather: null, error: 'Error, please try again'});
          } else {
            let weatherText = `It's ${weather.main.temp}°F in ${weather.name}.`
            res.render('index', {weather: weatherText, error: null});
          }
        }
      });
    }
  });

});
var port = 9000;
app.listen(port, () => {
  console.log('Listing on port', port);
})
