var async = require('async');
var env = require('../config');
var uuid = require('node-uuid');
var AWS = require('aws-sdk');
AWS.config.update({region: env.REGION});

var gm = require('gm');
var fs = require('fs');

//var s3bucket = AWS.sign({service: 's3', path: '/my-bucket?X-Amz-Expires=12345', signQuery: true})
var s3bucket = new AWS.S3({});



//var s3bucket = new AWS.S3({signatureVersion: 'v4'});
/*var s3bucket = new AWS.S3( {
   // endpoint: 's3-eu-central-1.amazonaws.com',
	 	bucket: env.BUCKET_NAME,
		signatureVersion: 'v4',
		region: env.REGION
} );*/

var buildImage = function (keys, callback) {
    var key = uuid.v4() + '-glue';
    var paths = keys.length > 4 ? keys.slice(0, 4) : keys;

    async.waterfall([
        function (cb) {
            async.each(paths, function (path, eachCb) {
                gm(s3bucket.getObject({Key: path}).createReadStream()).write(path, eachCb);
            }, cb);
        },

        function (cb) {
            var sum = gm();

            paths.forEach(function (path) {
                sum = sum.append(path);
            });

            sum.append(true).stream(cb);
        },

        function (stdout, stderr, opt, cb) {
            var buf = new Buffer('');

            stdout.on('data', function (data) {
                buf = Buffer.concat([buf, data]);
            });

            stdout.on('end', function () {
                var data = {
                    Key : key,
                    Body: buf
                };

                s3bucket.putObject(data, cb);
            });
        },

        function (res, cb) {
            cb(null, {key: key});

            async.each(paths, function (path, eachCb) {
                fs.unlink(path, eachCb);
            });
        }
    ], callback);
};

module.exports.buildImage = buildImage;
