var winston = require('winston');
var env = process.env.NODE_ENV;
var path = require('path');

module.exports = function (module) {
    var dir = module.filename.split(path.sep).splice(-2).join(path.sep);
    var logger;
    if(env == 'local' || env == 'docker') {
        logger = new winston.Logger({
            transports: [
              new winston.transports.Console({
                colorize: true,
                level: 'verbose'
              })
            ]
        })
    }else if(env == 'development') {
      logger = new winston.Logger({
          transports: [
              // show logs in console
              new winston.transports.Console({
                  colorize: true,
                  level   : 'verbose',
              }),
            /*
              // save logs in file
              new winston.transports.File({
                  filename: 'logs/app-logs.log',
                  handleExceptions: true,
                  timestamp: true,
                  level   : 'info',
                  label   : dir
              })
              */
          ]
      });
    }else if(env == 'production') {
        logger = new winston.Logger({
            transports: [
                // save logs in file
                new winston.transports.File({
                    filename: 'logs/app-logs.log',
    								handleExceptions: true,
                    maxsize : '10000000', // 10 MB
                    maxFiles: '1000',
                    colorize: true,
    								timestamp: true,
                    level   : 'warn',
                    label   : dir
                })
            ]
        });
    }else {
        logger = new winston.Logger({
            transports: [
              new winston.transports.Console({
                colorize: true,
                level: 'verbose'
              })
            ]
        })
    }



    return logger;
};
