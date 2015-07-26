var BufferList = require('bl');
var onFinished = require('on-finished');

module.exports = function bufferResponse(res, cb) {
	var write = res.write;
	var end = res.end;
	var buf = new BufferList();
	res.write = function(data, enc) {
		if (buf != null && data != undefined) bufferAdd(buf, data, enc)
		write.bind(res)(data, enc);
	};
	res.end = function(data, enc) {
		if (buf != null && data != undefined) bufferAdd(buf, data, enc)
		end.bind(res)(data, enc);
	};
	onFinished(res, function(err) {
		// if some other express middleware kept a copy of write/end,
		// restoration here won't work as expected and our res.write/end
		// will be called with buf == null
		res.write = write;
		res.end = end;
		var len = parseInt(res.get('Content-Length'));
		if (!isNaN(len)) {
			buf = buf.slice(0, len);
		}
		if (!err && !res.finished && res.req.connection.destroyed) {
			res.statusCode = 0;
			buf = null;
		}
		cb(err, buf);
	});
};

function bufferAdd(buf, data, enc) {
	if (typeof data == "string") buf.append(new Buffer(data, enc));
	else if (data) buf.append(data);
}

