var BufferList = require('bl');
var onFinished = require('on-finished');

module.exports = function bufferResponse(res, cb) {
	var write = res.write;
	var end = res.end;
	var buf = new BufferList();
	res.write = function(data, enc) {
		if (data != undefined) bufferAdd(buf, data, enc)
		write.bind(res)(data, enc);
	};
	res.end = function(data, enc) {
		if (data != undefined) bufferAdd(buf, data, enc)
		end.bind(res)(data, enc);
	};
	onFinished(res, function(err) {
		res.write = write;
		res.end = end;
		var len = parseInt(res.get('Content-Length'));
		if (!isNaN(len)) buf = buf.slice(0, len);
		cb(err, buf);
	});
};

function bufferAdd(buf, data, enc) {
	if (typeof data == "string") buf.append(new Buffer(data, enc));
	else if (data) buf.append(data);
}

