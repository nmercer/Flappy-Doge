
/**
 * Module dependencies.
 */
var express = require('express')
  , http = require('http')
  , path = require('path')
  , mysql = require('mysql')
  , async = require('async')
  , uuid = require('node-uuid') // Todo - Wut?
  , app = express();

// all environments
app.set('port', process.env.PORT || 8900);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 
app.use(express.urlencoded());

// Todo - Setup some sort of prod BS
prod = true;

// DEV
// ===============================================
// if ('development' == app.get('env')) {
if(!prod) {
	console.log('Using development settings.');
  	app.set('connection', mysql.createConnection({
   		host: '127.0.0.1',
    	user: 'root',
    	port: '3306',
    	password: ''}));
  	app.use(express.errorHandler());
}

// PROD
// ===============================================
// if ('production' == app.get('env')) {
else { 
	console.log('Using production settings.');
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
	name = req.param('name', null);
	score = req.param('score', null);

	// Todo - Clean data for asshats
	if(name == null || score == null) {
		// Todo - Die
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

app.post('/scoreboard', function(req, res) {
	console.log('Scoreboard Called');

	res.app.get('connection').query( 'SELECT * FROM SCOREBOARD ORDER BY SCORE DESC LIMIT 10', function(err, rows) {
    	if (err) {
      		res.send({'status':'error'});
    	} else {
      		res.send({'status':'success', 'scores':rows});
  		}
  	});
});

var client = app.get('connection');
async.series([
 	function connect(callback) {
    	client.connect(callback);
  	},
  	function clear(callback) {
    	client.query('DROP DATABASE IF EXISTS mynode_db', callback);
  	},
  	function create_db(callback) {
    	client.query('CREATE DATABASE mynode_db', callback);
  	},
  	function use_db(callback) {
    	client.query('USE mynode_db', callback);
  	},
  	function create_table(callback) {
    	client.query('CREATE TABLE SCOREBOARD (' +
                     'NAME VARCHAR(40), ' +
			         'SCORE BIGINT, ' +
			         'TIME DATE)', callback);
  	},
  	function insert_default(callback) {
    	var score = {TIME: new Date(), 
    			     NAME: 'Nicholas John Mercer',
        			 SCORE: 1337133713371337};

    	client.query('INSERT INTO SCOREBOARD set ?', score, callback);
  	}
], function (err, results) {
	if (err) {
		console.log('Exception initializing database.');
		throw err;
	} else {
		console.log('Database initialization complete.');
	}
});
