// Copyright 2018, Google LLC.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const app = express();
const path = require("path");
const http = require ('http');
app.use(express.static(__dirname + "/public"));

// Send HTML at root, do not change
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

// Send Style, do not change
app.get('/style.css', (req, res) => {
    //Feel free to change the contents of style.css to prettify your Web app
    res.sendFile(path.join(__dirname+'/public/style.css'));
});

app.post('/ghome', (req,res) => {

    var data = ''; 

    http.get('http://' + req.headers.host + '/api', (resp) => {
        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            data = JSON.parse(data);
            console.log(data);

            var weather = "bring a ";
            switch (data.weather){
                case 'Snow': 
                    weather += "hat, ear cups, scarf and winter boots";
                    break;
                case 'Rain':
                    weather += "umbrella"
                    break;
                default:
                    weather = "Enjoy the weather";
            }

            res.send({
                'fulfillmentText': weather,
                'fulfillmentMessages': [{"text": {"text": ["Montreal"]}}],
                'source': 'This is the source'
            });
        });
    }).on('error', (err) => {
        console.log('Failed');
            return;
    });
});
// [END hello_world]
const api = require('./api');
//console.log(api);
app.get('/api/', api.compute);

if (module === require.main) {
    // [START server]
    // Start the server
    const server = app.listen(process.env.PORT || 8080, () => {
        const port = server.address().port;
        console.log(`App listening on port ${port}`);
    });
    // [END server]
}

module.exports = app;