express-buffer-response
=======================

Buffer express response and call back when finished

# Usage

```js
var BufferRes = require('express-buffer-response');
app.use(function(req, res, next) {
	if (req.method != "GET") return next();
	// here be cache read logic
	BufferRes(res, function(err, bl) {
		// get the err from onFinished
		// and a bufferList containing the actual response chunks
		// here be cache store logic
		bl.pipe(fs.createWriteStream('cachefile'));
	});
	next();
});
```

# Nota bene

Works with express-session since 1.0.3

# License

MIT

