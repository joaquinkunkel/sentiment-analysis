var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var app = express();
var time = new Date();
var bp = require('body-parser');
var Twitter = require('twitter')

var T = new Twitter({
  consumer_key:         'kij47kAvvt6tPIVit99ATR3kq',
  consumer_secret:      'yirA83ukpyt0QstxtJhIFnLzVU5xbOFWVXe7Q2oTlyGtdwLBpW',
  access_token_key:     '408032569-GGR6Hba7RAbeFJx5CE7jKAYZ4BiXNhVmQmNGQGGj',
  access_token_secret:  'GpuKie9Asor6uAf9XImhFqjUDvCcRH2GxOkcfPNbuOyzX',
});

app.set('port', 8080);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bp.urlencoded({
  extended: true
}));
app.use(bp.json());


http.createServer(app)
  .listen(app.get('port'),
  function(){
    console.log('Server running on port',app.get('port'));
  });

let accessKey = '46fbf8b702064370a7f167823b27cc15';

let uri = 'westcentralus.api.cognitive.microsoft.com';
let spath = '/text/analytics/v2.0/sentiment';

// MAIN SENTIMENTS FUNCTION

function analyzeSentiments(documents, callback){
  var body__;

  let body = JSON.stringify (documents);

  let request_params = {
      method : 'POST',
      hostname : uri,
      path : spath,
      headers : {
          'Ocp-Apim-Subscription-Key' : accessKey,
      }
  };

  let req = https.request (request_params, function(response){
    let body = '';
    response.on ('data', function (d) {
        body += d;
    });
    response.on ('end', function () {
        let body_ = JSON.parse (body);
        body__ = JSON.stringify (body_, null, '  ');
        callback(body__);
    });
    response.on ('error', function (e) {
        console.log ('Error: ' + e.message);
    });
  });

  req.write (body);
  req.end ();

}


app.get('/',function(req,res){
  res.sendFile('/index.html');
  //__dirname : It will resolve to your project folder.
});

app.post('/analyze', function(req, res){
  let documents = req.body;
  analyzeSentiments(req.body, function(resBody){
    console.log(resBody);
    res.send(resBody);
  });
});

app.post('/analyze_tweets', function(req, res){
  console.log("ANALYZING");
  let body = req.body;
  console.log(req.body);

  let reqQuery = req.body.reqQuery;
  let reqCount = req.body.reqCount;
  let reqMode = req.body.reqMode;

  var extension, params;

  if(reqMode == 0) {
    extension = 'statuses/user_timeline';
    params = { screen_name: reqQuery, count: reqCount };
  }
  else {
    extension = 'search/tweets';
    params = { q: '%23'+reqQuery, count: reqCount };
  }

  let documentArray = [];

  T.get(extension, params, function(err, rawdata, response){

    if(err){
      res.send(null);
    }
    else{
      console.log('DATA:', rawdata);
      var data;

      if(reqMode == 0) data = rawdata;
      else data = rawdata.statuses;

      for(i in data){
        var tweet = data[i].text;
        documentArray.push({
          language: 'en',
          id: (parseInt(i)+1).toString(),
          text: tweet,
          user: {
            screen_name: data[i].user.screen_name,
            name: data[i].user.name,
            picture: data[i].user.profile_image_url
          }
        });
      }

      analyzeSentiments({
        documents: documentArray
      }, function(resBody){
        res.send({
          tweets: documentArray,
          scores: JSON.parse(resBody).documents
        });
      });

    }

  });

});
