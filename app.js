

var webshot = require('webshot')
var express = require('express')
var uuid = require('node-uuid')
var path = require('path')
var URL = require('url')
var fs = require('fs')
var crypto = require('crypto')
var querystring = require('querystring');
var app = express()

// var nginx = path.join(__dirname, 'temp')
var nginx = '/opt/data/nginx/html/future-driver/clp/'

app.get('/', function (req, res) {
    res.send('WebShot!');
});

app.get('/shot', function (req, res) {
    var cfg = {
        screenSize: {
            width: 1253,
            height: 900
        },
        shotSize: {
            width: 'all',
            height: 'all'
        }
    }
    var p = req.query.p
    var t = req.query.t

    if (t == 'MOBILE') {
        cfg.screenSize = {
            width: 380,
            height: 692
        }
    }

    var d = req.query.d
    d = JSON.parse(d)

    fs.access(nginx, fs.F_OK, (err) => {
        if (err) {
            fs.mkdirSync(nginx)
        }
        var fileName = uuid.v4() + '.png'
        var file = path.join(nginx, fileName)
        var u = p + "?d=" + encodeURIComponent(JSON.stringify(d))
        console.log(u)
        webshot(u, file, cfg, function (err) {
            var md5sum = crypto.createHash('md5');
            var stream = fs.createReadStream(file);
            stream.on('data', function (chunk) {
                md5sum.update(chunk);
            });
            stream.on('end', function () {
                var md5 = md5sum.digest('hex').toUpperCase() + '.png';
                var md5FilePath = path.join(nginx, md5)
                if (fs.existsSync(md5FilePath)) {
                    fs.unlink(file)
                    res.send(md5)
                } else {
                    fs.rename(file, md5FilePath, function () {
                        res.send(md5)
                    })
                }
            });
        });
    });
});

var server = app.listen(9999, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Webshot app listening at http://%s:%s', host, port);
});

