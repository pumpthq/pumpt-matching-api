module.exports = function (query) {
    var args = [].slice.call(arguments, 1);
    var i = args.length;
    var filterObj = {};

    while (i--) {
        if (query[args[i]]) {
            filterObj[args[i]] = query[args[i]];
        }
    }

    return filterObj;
};
