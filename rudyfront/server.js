var express = require('express');
var compression = require("compression");
var app = express();

app.use(compression({
    filter: shouldCompress
}));

function shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
        // don't compress responses with this request header
        return false
    }

    // fallback to standard filter function
    return compression.filter(req, res);
}

app.use('/public', express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + (process.env.NODE_ENV != 'production' ? '/public/index.html' : '/public/index.html'));
});

app.get('*', function(req, res) {
    res.sendFile(__dirname + (process.env.NODE_ENV != 'production' ? '/public/index.html' : '/public/index.html'));
});

app.listen(process.env.PORT || 8000);

console.log('server is listening on ' + (process.env.PORT || 8000));