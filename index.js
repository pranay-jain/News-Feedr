const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === process.env.FB_VERIFICATION_TOKEN) {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
          console.log("entered" + event.message.text);
          var text;
          if (event.message.text === "Hi" || event.message.text === "Hello" || event.message.text === "business") {
            text = "you entered " + event.message.text;
          } else {
            text = receivedTextMessage(event.message.text)
          }
            sendTextMessage(sender,"Message:" + text)
        }
    }
    res.sendStatus(200)
});

function receivedTextMessage(text) {
  //var dict = dictionary;
  var dictionary = {
      general: ["general"],
      business: ["business"],
      entertainment: ["entertainment"],
      gaming: ["gaming"],
      science: ["science"],
      sport: ["sport"],
      technology:["technology", "tech", "automation", "machinery", "computers"]
  }
  var parsed = text.toLowerCase();
  var s;
  //for(var i=0;i<parsed.length;i++) {
    for(var p in dictionary) {
      console.log(p);
      if(parsed.indexOf(p) > -1) {
        console.log("found" + p);
         s = p;
          break;
      }
    }
  //}

  var theUrl= "https://newsapi.org/v1/sources?category=business";

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
  xmlHttp.send( null );
  var sources=xmlHttp.responseText;
  var allSources=JSON.parse(sources);
  console.log(sources)
  var sourceids=[];
  for(var i=0;i<allSources["sources"].length;i++){
      sourceids.push(allSources["sources"][i]["id"]);
  }
  //console.log(sourceids);
  var apikey="a16f39b8980544fd91723092e5f11105";
  var returnarr=[];
  for(var i=0;i<sourceids.length;i++){
      var theUrl2= "https://newsapi.org/v1/articles?source="+sourceids[i]+"&apiKey="+apikey;
     //console.log(theUrl2);

     var xmlHttp2 = new XMLHttpRequest();
     xmlHttp2.open( "GET", theUrl2, false ); // false for synchronous request
     xmlHttp2.send( null );
     var articles=xmlHttp2.responseText;
      articles=JSON.parse(articles);
      articles=articles["articles"];
      for(var j=0;j<articles.length;j++){
          var articletoadd={};
          articletoadd["url"]=articles[j]["url"];
          articletoadd["imageurl"]=articles[j]["urlToImage"];
          articletoadd["title"]=articles[j]["title"];
          articletoadd["description"]=articles[j]["description"];
          returnarr.push(articletoadd);
          if(returnarr.length==4){
          break;
      }
      }
      if(returnarr.length==4){
          break;
      }
  }
  var returnarray = JSON.stringify(returnarr);
  return returnarray;
}

function sendTextMessage(sender, text) {
    //let messageData = { text:text }
    let messageData = JSON.parse(text);
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData['description'],
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

const token = process.env.FB_PAGE_ACCESS_TOKEN
