//set express application
var express = require('express');
var redis = require('redis');
var fs = require('fs');
//var _mysql = require('mysql'); //for mysql connection
var app = express();

//for parsing request JSON to send to database
app.use(express.bodyParser());

//for rendering HTML views on server
app.set('views', __dirname);
app.use('/', express.static(__dirname + '/'));
app.use('/img', express.static(__dirname + '/img'));
app.engine('html', require('ejs').renderFile);

//mysql
/*var HOST = '74.220.207.138';
var MYSQL_USER = 'stephan7_donbot';
var MYSQL_PASS = 'givehimtheclamps0928';
var DATABASE = 'stephan7_dondale';
var TABLE = 'test';

var mysql = _mysql.createConnection({
    host: HOST,
    user: MYSQL_USER,
    password: MYSQL_PASS,
});

mysql.query('use ' + DATABASE);*/

//create redis client
var client = redis.createClient();
//var userid = new Date().toString().split(':').join('-');
client.setnx('participantcount',0);
var userid;

//show given page when app loaded on localhost:3000
app.get('/', function(req, res) {
    res.render('test.html');
    client.get('participantcount', function(err, count) {
	if (err) return console.log(err);
	userid = parseInt(count)+1;
    });
});

//to respond to .ajax query in html document at localhost:8080
app.post('/endpoint', function(req, res){
	var obj = {}; //I really don't know what this does, but everything breaks without it.
	//let's get some redis up in this bitch
	client.hset('user'+userid+':'+req.body.session, 'user', userid);
	client.hmset('user'+userid+':'+req.body.session, req.body);
	client.save();
	
	//for sending data to mysql database
	/*mysql.query('insert into '+ TABLE +' (Title, Message) values ("' + req.body.title + '", "' + req.body.message + '")',
	function selectCb(err, results, fields) {
		if (err) throw err;
		else res.send('success');
	});*/
	res.send(req.body);
});

//to write data to a csv file
app.get('/end', function(req, res) {
    client.incr('participantcount');
    var stream = fs.createWriteStream('data.csv');
    res.render('end.html');
    client.keys('user*', function(err, keys) {
	if (err) return console.log(err);
	client.hkeys(keys[0], function(err, keyvalues) {
	    if (err) return console.log(err);
	    stream.write(keyvalues.toString()+'\n');
	    for (var k=0; k<keys.length; k++) {
		client.hvals(keys[k], function(err, values) {
		    if (err) return console.log(err);
		    stream.write(values.toString()+'\n');
		});
	    }
	});
    });
});
 
app.listen(8080);
console.log('listening on localhost:8080');