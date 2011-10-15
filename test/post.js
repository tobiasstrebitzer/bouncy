var test = require('tap').test;
var bouncy = require('bouncy');
var http = require('http');
var net = require('net');

test('POST with http', function (t) {
    var port = Math.floor(Math.random() * (Math.pow(2,16) - 1e4) + 1e4);
    t.plan(3);
    var b = bouncy(function (req, bounce) {
        t.equal(req.headers.host, 'localhost:' + port);
        bounce(p);
    });
    
    var p = Math.floor(Math.random() * (Math.pow(2,16) - 1e4) + 1e4);
    var s = net.createServer(function (c) {
        var data = '';
        c.on('data', function (buf) {
            data += buf.toString();
            if (data.match(/\r\n\r\n$/)) {
                c.write([
                    'HTTP/1.1 200 200 OK',
                    'Content-Type: text/plain',
                    'Connection: close',
                    '',
                    'oh hello'
                ].join('\r\n'));
                c.end();
            }
        });
    });
    s.listen(p);
    
    b.listen(port, function () {
        var opts = {
            method : 'POST',
            host : 'localhost',
            port : port,
            path : '/'
        };
        var req = http.request(opts, function (res) {
            t.equal(res.headers['content-type'], 'text/plain');
            
            var data = '';
            res.on('data', function (buf) {
                data += buf.toString();
                if (data === 'oh hello') {
                    t.equal(data, 'oh hello');
                    res.socket.end();
                    b.close();
                    s.close();
                    t.end();
                }
            });
        });
        req.write('pow!');
        req.end();
    });
});
