var BufferRes = require('../');
var expect = require('expect.js');
var fs = require('fs');
var express = require('express');
var path = require('path');
var http = require('http');

var testFile = path.join(__dirname, 'test.txt');
var ff = [];
var i=0;
while (i++ < 10) ff.push('some text');
ff = ff.join(' ');
fs.writeFileSync(testFile, ff);

var app = express();

function cacheMw(req, res, next) {
	BufferRes(res, function(err, buf) {
		expect(res.statusCode).to.be(200);
		if (req.url == '/a') {
			expect(buf.toString()).to.be('{"mykey":"myval"}');
		}
		if (req.url == "/b") {
			expect(buf.length).to.be(ff.length);
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

var port = app.listen().address().port;

http.get('http://localhost:' + port + '/a');
http.get('http://localhost:' + port + '/b');
http.get('http://localhost:' + port + '/a');
http.get('http://localhost:' + port + '/a');
http.get('http://localhost:' + port + '/b');
http.get('http://localhost:' + port + '/b');

process.on('exit', function() {
	try {
		fs.unlinkSync(testFile);
	} catch(e) {}

	expect(count).to.be(6);
});

