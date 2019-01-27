const http = require('http');

const weatherApi = 'http://api.openweathermap.org/data/2.5/weather?appid=47f10729a078ec6afee5311181889ab9&q=';
const connectionString = 'whateverweather:us-east1:whateverweather';
const mysql = require('mysql');

function openDbConnection() {
    var con = mysql.createConnection({
        host: '35.237.213.41',
        user: 'ww',
        password: 'Password1',
        database: 'whatever_weather'
    });
    
    con.connect((err) => {
        if (err) throw err;
        console.log('Connected');
    });
    
    return con;
}

function getCity() {
    return new Promise(function (resolve, reject) {
        var con = openDbConnection();
        
        var sql = 'SELECT * FROM Configuration WHERE Name = \'City\';';
        con.query(sql, function (error, results, fieds) {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
}

function getCountry() {
    //return 'CA';
    return new Promise(function (resolve, reject) {
        var con = openDbConnection();
        
        var sql = 'SELECT * FROM Configuration WHERE Name = \'Country\';';
        con.query(sql, function (error, results, fields) {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
} 

function getIdealTemp() {
    return 21;
}

function kelvinToCelsius(k) {
    return k - 273.15;
}

function calculateEffectiveWeather(temp, temperatureData) {
    if (temp <= 5 && temp > -50) {
        temp = 13.12 + 0.6215 * temp - 11.37 * Math.pow(temperatureData.wind.speed, 0.16) + 0.3965 * temp * Math.pow(temperatureData.wind.speed, 0.16);
    }
    else if (temp >= 26.7) {
        // Humidex, probably won't need it
        //temp = 
    }
    
    return temp;
}

function getClothes() {
    return new Promise(function (resolve, reject) {
        var con = openDbConnection();
        
        var sql = 'SELECT * FROM Clothes;';
        con.query(sql, function (error, results, fields) {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

module.exports = {
    compute: function (req, res) {

        getCity().then(function (cityRow) {
            getCountry().then(function (countryRow) {                
                var weatherData = '';
                //console.log([weatherApi, cityRow.Value, ',', countryRow.Value].join(''));
                http.get([weatherApi, cityRow.Value, ',', countryRow.Value].join(''), (resp) => {
                    resp.on('data', (chunk) => {
                        weatherData += chunk;
                    });

                    resp.on('end', () => {
                        weatherData = JSON.parse(weatherData);

                        const idealTemp = getIdealTemp();
                        
                        //console.log(weatherData);

                        var baseTemp = Number(kelvinToCelsius(weatherData.main.temp).toFixed(1));
                        var effectiveTemp = calculateEffectiveWeather(baseTemp, weatherData);
                        var deltaTemp = idealTemp - effectiveTemp;
                        
                        var targetN = Number(deltaTemp / 2).toFixed(1);
                        
                        console.log(targetN);
                        
                        //var layers = { null, null, null };
                        getClothes().then(function (clothesRows) {
                            console.log(clothesRows);
                        });
                        
                        //for (var i = 0; i < 
                        
                        resultObj = {
                            'city' : cityRow.Value,
                            'weather': 'Clouds',
                            'targetTemperature': 21,
                            'achievedTemperature': 21,
                            'baseTemperature': 17,
                            'topLayers': [
                                null,
                                {
                                    'Name': 'Red Long-Sleeved Shirt',
                                    'TempInc': 2
                                },
                                null
                            ],
                            'bottomLayers': [
                                null,
                                {
                                    'Name': 'Big Blue Pants',
                                    'TempInc': 2
                                },
                                null
                            ],
                        };
                        /*console.log(weatherData);
                        console.log();
                        console.log(resultObj);*/
                        res.status(200).send(resultObj);
                    });
                }).on('error', (err) => {
                    console.log('Failed');
                    return;
                });
            });
        });
    }
}
