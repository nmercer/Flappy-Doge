// Todo - Setup some sort of prod BS
prod =  true;

/// SETUP
// ===============================================
var express = require('express')
  , http = require('http')
  , path = require('path')
  , mysql = require('mysql')
  , async = require('async')
  , cookieSessions = require('cookie-sessions')
  , uuid = require('node-uuid')
  , app = express();

var RedisStore = require('connect-redis')(express);

app.set('port', process.env.PORT || 8900);
app.use(express.compress());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 
app.use(express.urlencoded());
app.use(express.cookieParser());

// DEV
// ===============================================
if(!prod) {
    // app.use(express.session({
    //     store: new RedisStore({
    //         host: 'localhost',
    //         port: 6379,
    //         db: 1,
    //         pass: ''
    //     }),
    //   secret: uuid.v4()
    // }));

  	app.set('connection', mysql.createConnection({
        host: '127.0.0.1',
    	  user: 'root',
    	  port: '3306',
    	  password: ''}));

  	app.use(express.errorHandler());
}

// PROD
// ===============================================
else { 
  	app.set('connection', mysql.createConnection({
    	host: process.env.RDS_HOSTNAME,
    	user: process.env.RDS_USERNAME,
    	password: process.env.RDS_PASSWORD,
    	port: process.env.RDS_PORT}));
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// SAVE DOGE
// ===============================================
app.post('/save', function(req, res) {
	console.log('Save Called');
	name = req.param('name', null).replace(/[^a-zA-Z0-9]+/g, "");
	score = req.param('score', null).replace(/[^0-9]+/g, "");

	if(name == null || score == null) {
		res.send({'status':'error'});
    return;
	}

	var score = { TIME: new Date(), NAME: name, score: score};
  	req.app.get('connection').query('INSERT INTO SCOREBOARD set ?', score, function(err) {
    	if (err) {
      		res.send({'status':'error'});
    	} else {
      		res.send({'status':'success'});
    	}
  	});

});

// DOGEBOARD
// ===============================================
app.post('/scoreboard', function(req, res) {

  console.log(req.cookies);

	console.log('Scoreboard Called');

	res.app.get('connection').query( 'SELECT * FROM SCOREBOARD ORDER BY SCORE DESC LIMIT 100', function(err, rows) {
    	if (err) {
      		res.send({'status':'error'});
    	} else {
      		res.send({'status':'success', 'scores':rows});
  		}
  	});
});

// DOGEBASE
// ===============================================
var client = app.get('connection');
async.series([
 	function connect(callback) {
    	client.connect(callback);
  	},
  	function use_db(callback) {
    	client.query('USE mynode_db', callback);
  	}
], function (err, results) {
	if (err) {
		console.log('Exception initializing dogebase.');
		throw err;
	} else {
		console.log('Dogebase Connected.');
	}
});

// RESET DOGEBASE
// ===============================================
// async.series([
//  	function connect(callback) {
//     	client.connect(callback);
//   	},
//   	function clear(callback) {
//     	client.query('DROP DATABASE IF EXISTS mynode_db', callback);
//   	},
//   	function create_db(callback) {
//     	client.query('CREATE DATABASE mynode_db', callback);
//   	},
//   	function use_db(callback) {
//     	client.query('USE mynode_db', callback);
//   	},
//   	function create_table(callback) {
//     	client.query('CREATE TABLE SCOREBOARD (' +
//                      'NAME VARCHAR(40), ' +
// 			         'SCORE BIGINT, ' +
// 			         'TIME DATE)', callback);
//   	},
//   	function insert_default(callback) {
//     	var score = {TIME: new Date(), 
//     			     NAME: 'Nicholas John Mercer',
//         			 SCORE: 1337};

//     	client.query('INSERT INTO SCOREBOARD set ?', score, callback);
//   	}
// ], function (err, results) {
// 	if (err) {
// 		console.log('Exception initializing database.');
// 		throw err;
// 	} else {
// 		console.log('Database initialization complete. Reset.');
// 	}
// });

