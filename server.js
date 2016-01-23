//Libraries
var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql');
var PG = require('pg');
var FS = require('fs');

var APIs = require("./constants/constants_api.js"); 
var PARAMs = require("./constants/constants_params.js");
var PGs = require("./constants/constants_pg.js");

var IMAGE_PATH = "./images/events/";
////////

var conString = "postgres://" + PGs.USER + ":" + PGs.PASS + "@" + PGs.HOST + ":" + PGs.PORT + "/" + PGs.DB;

var client = new PG.Client(conString);
client.connect();

function initialization () {
}

function cleanup() {
    client.end();
}

//API Calls
app.get(APIs.UPDATE_CHEF_LOCATION, function (req, res) {
   initialization();

   var userId = req.param(PARAMs[USERID]);
 
   var returnData = {};
   res.end( returnData );

   cleanup();
});

app.get(APIs.DECLINE_EVENT, function (req, res) {
   initialization();

   var returnData = {};
   res.end( returnData );

   cleanup();
});

app.get(APIs.ACCEPT_EVENT, function (req, res) {
   initialization();

   var returnData = {};
   res.end( returnData );

   cleanup();
});

app.get(APIs.CHECKIN_USER, function (req, res) {
   initialization();

   var returnData = {};
   res.end( returnData );

   cleanup();
});

app.get(APIs.GET_UPCOMING_EVENTS, function (req, res) {
   initialization();

   client.query("SELECT * FROM " + PGs.TABLE_EVENTS + " where event_time >= now() and user_id is null;", function(err, result) {
       res.end( JSON.stringify(result.rows) );
       cleanup();
   });
});

var portId = APIs.PORT;
var server = app.listen(portId, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});
