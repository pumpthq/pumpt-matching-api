var winston = require('winston');
var expressWinston = require('express-winston');

module.exports = expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json    : true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/hook-logs.log',
            maxsize : '10000000', // 10 MB
            maxFiles: '10',
            colorize: true,
            level   : 'warn'
        })
    ],

    meta             : true,
    expressFormat    : true,
    colorize         : true,
    requestWhitelist : ['body', 'session'],
    responseWhitelist: ['body'],
    ignoreRoute      : function (req, res) {
        return false;
    }
});
