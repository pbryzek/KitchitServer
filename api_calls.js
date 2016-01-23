//Libs
var request = require('request');
var APIs = require("./constants/constants_api.js");
var PARAMs = require("./constants/constants_params.js");

var domain = "http://localhost:" + APIs.PORT;

//Hardcode a userId for testing.
var userId = "1";
var upcomingEventsPath = domain + APIs.GET_UPCOMING_EVENTS;
var checkinUserPath = domain + APIs.CHECKIN_USER;

function createUrl(url, params) {
    var encodedParams = encodeQueryData(params);
    var fullUrl = url + "?" + encodedParams;
    return fullUrl;
}

function encodeQueryData(params) {
   var ret = [];
   for (var d in params)
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(params[d]));
   var params = ret.join("&");
   return params;
}

//var params = {};
//params[PARAMs.USERID] = userId
//var upcomingUrl = createUrl(upcomingEventsPath, params);

request(upcomingEventsPath, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) 
    } else {
        console.log("error " + error);
    }
});

