//load the required modules
var express = require('express');
var http = require('http');

//init our expressJS application
var app = express();
//start an HTTP server with the express application variable
var server = http.createServer(app);

//set up the socketIO and tell it to listen on the http server
var io = require('socket.io').listen(server);

//tell express to automatically serve static files in the public directory
app.use(express.static(__dirname + '/public'));

//set some options for socket.io
io.configure(function () {
    io.set('transports', ['websocket']);
    io.set('resource', '/public/socket.io');
});



//socket methods
io.sockets.on('connection', function (socket) {
   //TODO: put your socket code here
});



//listen
var port = process.env.PORT || 8082;
server.listen(port);
console.log("Server listening on port " + port);