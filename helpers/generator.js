var Generator = function () {

    // generate number from diapason [min, max]
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    this.generateToken = function (amount) {
        var secretChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var barrier = secretChars.length;
        var i = amount || 59;
        var result = [];

        for (; i >= 0; i--) {
            result.push(secretChars[getRandomInt(0, barrier - 1)]);
        }

        return result.join('');
    };
};

var generator = new Generator();

module.exports = generator;
