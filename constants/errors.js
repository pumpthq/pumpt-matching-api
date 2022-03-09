var duplicatedKeys = [
    'email',
    'name'  // company name
];

module.exports = {
    ERR                 : 'Internal Server Error',
    REJECTED            : 'You have been rejected in creating account',
    NOT_FOUND           : 'Sorry, but data not found',
    FORBIDDEN           : 'Forbidden',
    WRONG_PASS          : 'Wrong password',
    NO_COMPANY          : 'You don\'t have company. Please, create company first.',
    WRONG_LINK          : 'Bad request. Please use link from email',
    WRONG_EMAIL         : 'Email not found',
    BAD_REQUEST         : 'Some data is not valid',
    NO_VACANCIES        : 'You don\'t have any vacancy. Please, create vacancy before.',
    UNAUTHORIZED        : 'Unauthorized',
    NOT_APPROVED        : 'Your application has not approved yet',
    NOT_CONFIRMED       : 'Not confirmed registration',
    NOT_AUTHORIZED      : 'User is not authorized',
    NOT_SUBSCRIBED      : 'Such email has not subscribed',
    WRONG_PASS_OR_LOGIN : 'That email and password combination is not valid.',
    ONLY_FOR_ADMIN      : 'Access only for admin',
    ALREADY_CONFIRMED   : 'You have already confirmed this email.',
    EMAIL_NOT_REGISTERED: 'Sorry, we can\'t recognize that email',
    ALREADY_HAVE_COMPANY: 'You already have a company attached to this account. Please, remove that account first.',

    DUPLICATE_FIELD_MESSAGE: 'This {field} is already in use. Please set another {field}',

    error: function (status, message, invalidObj) {
        var err = new Error();
        var errors = [];
        var keysLength;
        var keys;
        var len;
        var i;

        err.message = message || this.ERR;
        err.status = status || 500;

        if (invalidObj) {
            keys = Object.keys(invalidObj);
            keysLength = keys.length;

            for (i = 0, len = keysLength; i < len; i++) {
                errors = errors.concat(invalidObj[keys[i]]);
            }
        }
        err.errors = errors;

        return err;
    },

    // use this function to handle mongo errors for avoiding 500 statuses and provide readable message for users
    mongo: function (status, err) {
        var self = this;
        var error = new Error();
        var message;

        if (!err) return;

        function parseMongoDuplicateMessage(mes) {
            var duplicateFieldMessage = self.DUPLICATE_FIELD_MESSAGE;
            var len = duplicatedKeys.length;
            var dupField;

            while (len--) {
                if (mes.indexOf(duplicatedKeys[len]) > -1) {
                    dupField = duplicatedKeys[len];
                    break;
                }
            }

            return duplicateFieldMessage.replace(/\{field\}/g, dupField);
        }

        if (err.code === 11000) {
            message = parseMongoDuplicateMessage(err.message);
        }

        error.message = message || err.message;
        error.errors = [];
        error.status = status;

        return error;
    }
};

//     100: 'Continue',
//     101: 'Switching Protocols',
//     200: 'OK',
//     201: 'Created',
//     202: 'Accepted',
//     203: 'Non-Authoritative Information',
//     204: 'No Content',
//     205: 'Reset Content',
//     206: 'Partial Content',
//     300: 'Multiple Choices',
//     301: 'Moved Permanently',
//     302: 'Found',
//     303: 'See Other',
//     304: 'Not Modified',
//     305: 'Use Proxy',
//     307: 'Temporary Redirect',
//     400: 'Bad Request',
//     401: 'Unauthorized',
//     402: 'Payment Required',
//     403: 'Forbidden',
//     404: 'Not Found',
//     405: 'Method Not Allowed',
//     406: 'Not Acceptable',
//     407: 'Proxy Authentication Required',
//     408: 'Request Time-out',
//     409: 'Conflict',
//     410: 'Gone',
//     411: 'Length Required',
//     412: 'Precondition Failed',
//     413: 'Request Entity Too Large',
//     414: 'Request-URI Too Large',
//     415: 'Unsupported Media Type',
//     416: 'Requested Range not Satisfiable',
//     417: 'Expectation Failed',
//     422: 'Unprocessable Entity',
//     424: 'Failed Dependency',
//     429: 'Too Many Requests',
//     451: 'Unavailable For Legal Reasons',
//     500: 'Internal Server Error',
//     501: 'Not Implemented',
//     502: 'Bad Gateway',
//     503: 'Service Unavailable',
//     504: 'Gateway Time-out',
//     505: 'HTTP Version not Supported',
//     507: 'Insufficient Storage',
//     CONTINUE: 100,
//     SWITCHING_PROTOCOLS: 101,
//     OK: 200,
//     CREATED: 201,
//     ACCEPTED: 202,
//     NON_AUTHORITATIVE_INFORMATION: 203,
//     NO_CONTENT: 204,
//     RESET_CONTENT: 205,
//     PARTIAL_CONTENT: 206,
//     MULTIPLE_CHOICES: 300,
//     MOVED_PERMANENTLY: 301,
//     FOUND: 302,
//     SEE_OTHER: 303,
//     NOT_MODIFIED: 304,
//     USE_PROXY: 305,
//     TEMPORARY_REDIRECT: 307,
//     BAD_REQUEST: 400,
//     UNAUTHORIZED: 401,
//     PAYMENT_REQUIRED: 402,
//     FORBIDDEN: 403,
//     NOT_FOUND: 404,
//     METHOD_NOT_ALLOWED: 405,
//     NOT_ACCEPTABLE: 406,
//     PROXY_AUTHENTICATION_REQUIRED: 407,
//     REQUEST_TIMEOUT: 408,
//     CONFLICT: 409,
//     GONE: 410,
//     LENGTH_REQUIRED: 411,
//     PRECONDITION_FAILED: 412,
//     REQUEST_ENTITY_TOO_LARGE: 413,
//     REQUEST_URI_TOO_LONG: 414,
//     UNSUPPORTED_MEDIA_TYPE: 415,
//     REQUESTED_RANGE_NOT_SATISFIABLE: 416,
//     EXPECTATION_FAILED: 417,
//     UNPROCESSABLE_ENTITY: 422,
//     FAILED_DEPENDENCY: 424,
//     TOO_MANY_REQUESTS: 429,
//     UNAVAILABLE_FOR_LEGAL_REASONS: 451,
//     INTERNAL_SERVER_ERROR: 500,
//     NOT_IMPLEMENTED: 501,
//     BAD_GATEWAY: 502,
//     SERVICE_UNAVAILABLE: 503,
//     GATEWAY_TIMEOUT: 504,
//     HTTP_VERSION_NOT_SUPPORTED: 505,
//     INSUFFICIENT_STORAGE: 507
