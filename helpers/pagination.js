var CONSTANTS = require('../constants/main');

module.exports.skip = function (query, defaultLimit) {
    var limit = query.limit || defaultLimit || CONSTANTS.LIMIT || 10;
    var page = parseInt(query.page, 10);
    query.page = !page || page < 0 ? 1 : page;

    return (query.page - 1) * limit || 0;
};

module.exports.limit = function (query, defaultLimit) {
    var limit = parseInt(query.limit, 10);
    limit = limit < 1 ? 0 : limit;

    return limit || defaultLimit || CONSTANTS.LIMIT || 10;
};
