var sha1 = require('sha1');

module.exports = function (password) {
    return sha1(password);
};
