var async = require('async');
var admin = require('../constants/admin.json');
var User = require('../models/user')

module.exports = function (db) {
    this.clearDB = callback => {
        User.findOne({ "email": "admin@pumpt.com" }).remove().exec(callback);
    };

    this.fillDB = callback => {
        User.create(admin, callback);
    };
}
