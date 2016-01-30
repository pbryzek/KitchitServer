//Libraries
var express = require('express');
var app = express();
var fs = require("fs");
var PG = require('pg');
var FS = require('fs');
var QUERY = require('pg-query');
var GEOLIB = require('geolib');

var APIs = require("./constants/constants_api.js"); 
var PARAMs = require("./constants/constants_params.js");
var PGs = require("./constants/constants_pg.js"); 
////////

var CHECKIN_THRESHOLD_DISTANCE_METERS = 1000 * 10;

var conString = "postgres://" + PGs.USER + ":" + PGs.PASS + "@" + PGs.HOST + ":" + PGs.PORT + "/" + PGs.DB;
QUERY.connectionParameters = conString;

function initialization () {
}

function cleanup() {
}

function returnDataToClient(res, returnData, err) { 
    var success = true;
    var errMsg = '';
    if (err) {
        success = false;
	errMsg = errMsg + err;
	console.log("Error! " + err);
    }

    returnData[PARAMs.SUCCESS] = success;
    returnData[PARAMs.ERRORMSG] = errMsg;
    res.end( JSON.stringify(returnData) );
    cleanup();
}
//API Calls

app.get(APIs.UPDATE_CHEF_LOCATION, function (req, res) {
   initialization();

   var userId = req.query[PARAMs.USERID];
   var lat = req.query[PARAMs.LATITUDE];
   var long = req.query[PARAMs.LONGITUDE];

   var insertQuery = "INSERT INTO " + PGs.TABLE_LOCATION + " (user_id, latitude, longitude) values (" + userId + "," + lat + "," + long + ") ON CONFLICT (user_id) DO UPDATE SET latitude=" + lat + " , longitude=" + long + ";"; 
   var returnData = {}; 
   QUERY(insertQuery, function(err, rows, result) {
       returnDataToClient(res, returnData, err);
   });
});

app.get(APIs.CANCEL_EVENT, function (req, res) {
   initialization();

   var userId = req.query[PARAMs.USERID];
   var eventId = req.query[PARAMs.EVENTID];

   var insertQuery = "UPDATE " + PGs.TABLE_EVENTS + " set user_id = null where id = " + eventId + ";";

   var getEventsQuery = "SELECT * FROM " + PGs.TABLE_EVENTS + " where user_id = " + userId + ";";

   QUERY(getEventsQuery, function(err, rows, result) {
       var rows = result.rows;
       var returnData = {};
       if (rows.length > 0) {
       var row = rows[0];
       var thisUserId = row.user_id;
       if(thisUserId == userId) {
           var insertQuery = "UPDATE " + PGs.TABLE_EVENTS + " set user_id = null where id = " + eventId + ";";
           QUERY(insertQuery, function(err, rows, result) {
               returnDataToClient(res, returnData, err);
           });
       } else {
           var errMsg = "Sorry you can't cancel this event since it doesn't belong to you.";
           returnDataToClient(res, returnData, errMsg); 
       }
       } else {
	   var errMsg = "Sorry you can't cancel this event since it doesn't belong to you.";
           returnDataToClient(res, returnData, errMsg);
       }
   });
});

app.get(APIs.DECLINE_EVENT, function (req, res) {
   initialization();

   var userId = req.query[PARAMs.USERID];
   var eventId = req.query[PARAMs.EVENTID];

   var insertQuery = "INSERT INTO " + PGs.TABLE_DECLINE_EVENTS + " (user_id, event_id) values (" + userId + "," + eventId + ");";

   QUERY(insertQuery, function(err, rows, result) {
        var returnData = {};
        returnDataToClient(res, returnData, err);
   });

   cleanup();
});

app.get(APIs.ACCEPT_EVENT, function (req, res) {
   initialization();

   var userId = req.query[PARAMs.USERID];
   var eventId = req.query[PARAMs.EVENTID];

   var insertQuery = "UPDATE " + PGs.TABLE_EVENTS + " set user_id =" + userId + " where id =" + eventId + ";";

   QUERY(insertQuery, function(err, rows, result) {
	var returnData = {};
	returnDataToClient(res, returnData, err);
   });
});

app.get(APIs.CHECKIN_USER, function (req, res) {
   initialization();

   var userId = req.query[PARAMs.USERID];
   var eventId = req.query[PARAMs.EVENTID];

   var lat = req.query[PARAMs.LATITUDE];
   var long = req.query[PARAMs.LONGITUDE];

   var getEventsQuery = "SELECT * FROM " + PGs.TABLE_EVENTS + " where id = " + eventId + ";";
   QUERY(getEventsQuery, function(err, rows, result) {
       var returnData = {};

       var rows = result.rows;
       if (rows.length > 0) {
           var row = rows[0];
           var eventLat = row.host_latitude;
           var eventLong = row.host_longitude;

           var distance = GEOLIB.getDistance(
	       {latitude: lat, longitude: long},
	       {latitude: eventLat, longitude: eventLong}
           );
           if (distance < CHECKIN_THRESHOLD_DISTANCE_METERS) {
               var insertQuery = "INSERT INTO " + PGs.TABLE_CHECKIN + " (user_id, event_id) values (" + userId + "," + eventId + ");";
               QUERY(insertQuery, function(err, rows, result) {
                   var returnData = {};
                   returnDataToClient(res, returnData, err);
               });
               returnDataToClient(res, returnData, err);
           } else {
               var errMsg = "Sorry but you are too far away to checkin to this event.";
               returnDataToClient(res, returnData, errMsg);
           }
       } else {
           returnDataToClient(res, returnData, err);
       }
   });
});

app.get(APIs.GET_MY_UPCOMING_EVENTS, function (req, res) {
   initialization();
 
   var userId = req.query[PARAMs.USERID];
   var getEventsQuery = "SELECT * FROM " + PGs.TABLE_EVENTS + " where event_time >= now() and user_id = " + userId + ";";
   QUERY(getEventsQuery, function(err, rows, result) {
       var returnData = {};
       returnData[PARAMs.EVENTS] = result.rows;
       returnDataToClient(res, returnData, err);
   });
});

app.get(APIs.GET_UPCOMING_EVENTS, function (req, res) {
   initialization();

   var userId = req.query[PARAMs.USERID];
   var getEventsQuery = "SELECT * FROM " + PGs.TABLE_EVENTS + " where event_time >= now() and user_id is null;";

   var allEvents;
   var returnData = {};
   QUERY(getEventsQuery, function(err, rows, result) {
       if(err) {
           returnDataToClient(res, returnData, err);
       } else {
           allEvents = result.rows;
           var getDeclinedQuery = "SELECT * FROM " + PGs.TABLE_DECLINE_EVENTS + " where user_id = " + userId;
           QUERY(getDeclinedQuery, function(err, rows, result) {
	       var finalEvents = [];
	       var declinedEvents = result.rows;
               for (var i = 0; i < allEvents.length; i++) {
		   var e1 = allEvents[i];
		   var addEvent = true;
	           for (var j = 0; j < declinedEvents.length; j++) {
		       var e2 = declinedEvents[j];
		       if (e1.id == e2.event_id) {
		           addEvent = false;
			   break;
		       }
		   }
		   if(addEvent) {
		       finalEvents.push(e1);
		   }
	       }
	       returnData[PARAMs.EVENTS] = finalEvents;
	       returnDataToClient(res, returnData, err); 
           });
       }
   });
});

var portId = APIs.PORT;
var server = app.listen(portId, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});
