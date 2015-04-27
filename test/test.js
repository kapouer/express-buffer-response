var BufferRes = require('../');
var expect = require('expect.js');
var fs = require('fs');
var express = require('express');
var session = require('express-session')
var path = require('path');
var http = require('http');


var testFile = path.join(__dirname, 'test.txt');
var ff = [];
var i=0;
while (i++ < 10) ff.push('some text');
ff = ff.join(' ');
fs.writeFileSync(testFile, ff);

var app = express();

var sessionMw = session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
});

function cacheMw(req, res, next) {
	BufferRes(res, function(err, buf) {
		if (req.url == '/a') {
			expect(res.statusCode).to.be(200);
			expect(buf.toString()).to.be('{"mykey":"myval"}');
		} else if (req.url == "/b") {
			expect(res.statusCode).to.be(200);
			expect(buf.length).to.be(ff.length);
		} else if (req.url == "/c") {
			expect(res.statusCode).to.be(200);
			expect(buf.toString()).to.be("lujon");
		} else if (req.url == "/d") {
			expect(res.statusCode).to.be(0);
			expect(buf).to.be(null);
		}
	});
	next();
}

var count = 0;

setTimeout(process.exit, 1000);

app.get('/a', cacheMw, function(req, res, next) {
	res.send({mykey: "myval"});
	count++;
});
app.get('/b', cacheMw, function(req, res, next) {
	res.sendFile(testFile);
	count++;
});
app.get('/c', sessionMw, cacheMw, function(req, res, next) {
	res.send("lujon");
	count++;
});
app.get('/d', cacheMw, function(req, res, next) {
	setTimeout(function() {
		res.send("not received by request");
		count++;
	}, 300);
});

var port = app.listen().address().port;

http.get('http://localhost:' + port + '/a');
http.get('http://localhost:' + port + '/b');
http.get('http://localhost:' + port + '/a');
http.get('http://localhost:' + port + '/a');
http.get('http://localhost:' + port + '/b');
http.get('http://localhost:' + port + '/b');
http.get('http://localhost:' + port + '/c');

var req = http.get('http://localhost:' + port + '/d').on('error', function(e) {
	// catch this expected error
});
setTimeout(function() {
	req.abort();
}, 100);

process.on('exit', function() {
	try {
		fs.unlinkSync(testFile);
	} catch(e) {}

	expect(count).to.be(8);
});

