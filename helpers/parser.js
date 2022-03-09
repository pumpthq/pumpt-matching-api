var uuid = require('node-uuid');
var sha1 = require('sha1');

// if label = true - with sorting, else without sort
function parseEnumsArray(data, label, options) {
    var parsedData = [];
    var limit = data.length;
    var i = 0;

    // check if we should use sorting
    data = label ? data.sort() : data;

    var isNeedAccurateIds = false,
        isNeedAlternateLastItem = false,
        baseIdOnLabel = '_';
    if(typeof options != 'undefined') {

        // Check if we'll need to generate accurate ids not randome ones
        if('isNeedAccurateIds' in options) {
            if(options.hasOwnProperty('isNeedAccurateIds')) {
                if(options['isNeedAccurateIds']) {
                    isNeedAccurateIds = true;
                }
            }
        }

        // Check if we'll need to add alternate flag to the last list element
        if('isNeedAlternateLastItem' in options) {
            if(options.hasOwnProperty('isNeedAlternateLastItem')) {
                if(options['isNeedAlternateLastItem']) {
                    isNeedAlternateLastItem = true;
                }
            }
        }

        // Check for constant to base accutate IDs on
        if('baseIdOnLabel' in options) {
            if(options.hasOwnProperty('baseIdOnLabel')) {
                baseIdOnLabel = options['baseIdOnLabel'];
            }
        }
    }

    var objectToAdd;

    for (; i < limit; i++) {
        objectToAdd = {};

        // Create ids from label or make them random
        if(isNeedAccurateIds) {
            objectToAdd.id = sha1(baseIdOnLabel + '_' + i);
            objectToAdd.title = data[i];
        } else {
            objectToAdd.id = uuid.v4();
            objectToAdd.title = data[i];
        }

        // Last array element
        if(isNeedAlternateLastItem) {
            if(i === limit - 1) {
                objectToAdd.alternative = true;
            }
        }
        parsedData.push(objectToAdd);
    }

    return parsedData;
}

function parseEnumsObject(dataObj) {
    var parsedData = [];
    var value;
    var child;
    var limit;
    var i;

    Object.keys(dataObj).forEach(function (key) {
        value = dataObj[key].sort();
        limit = value.length;
        child = [];
        i = 0;

        for (; i < limit; i++) {
            child.push({id: uuid.v4(), title: value[i]});
        }

        // add other item in tail
        child.push({id: uuid.v4(), title: 'Enter Experience Here', alternative: true}); /*title: 'Others'*/

        // define parsed data
        parsedData.push({id: uuid.v4(), title: key, items: child});
    });

    return parsedData;
}

module.exports = exports = {};


// CURRENT_INDUSTRIES_DROPDOWN_DATA
exports.parseCurrentIndustries = function (data) {
    var parsedData = [];
    var limit = data.length;
    var i = 0;
    var obj;

    for (; i < limit; i++) {
        //obj = {
        //    id: uuid.v4(),
        //    title: data[i]
        //};
        obj = {
            id: sha1('INDUSTRY_DROPDOWN_ITEM_' + i),
            title: data[i]
        };

        if (i === limit - 1) {
            obj.alternative = true;
        }

        parsedData.push(obj);
    }

    return [
        {
            id: sha1('INDUSTRY_DROPDOWN_GROUP_Root'),
            name: 'INDUSTRY_DROPDOWN_GROUP_Root',
            title: 'Root',
            type: 'group',
            items: parsedData
        }
    ];
};

// CURRENT_EXPERIENCE_DROPDOWN_DATA
exports.parseCurrentExperience = function (data) {
    var parsedData = [],
        itemArray = [],
        parsedItemArray = [],
        obj = {};
    for(var rootItem in data) {
        if(data.hasOwnProperty(rootItem)) {
            itemArray = data[rootItem];
            parsedItemArray = [];
            for(var j = 0, item; j < itemArray.length; j++) {
                item = itemArray[j];
                obj = {
                    id: sha1('EXPERIENCE_DROPDOWN_ITEM_' + rootItem + '_' + j),
                    name: 'EXPERIENCE_DROPDOWN_ITEM_' + rootItem + '_' + j,
                    title: item,
                    alternative: false
                };
                if(j === itemArray.length - 1) {
                    obj.alternative = true;
                }
                parsedItemArray.push(obj);
            }
            parsedData.push({
                id: sha1('EXPERIENCE_DROPDOWN_GOURP_' + rootItem),
                name: 'EXPERIENCE_DROPDOWN_GOURP_' + rootItem,
                title: rootItem,
                type: 'group',
                items: parsedItemArray
            });
        }
    }
    return parsedData;
    //return parseEnumsObject(data);
};


// DEGREES_DROPDOWN_DATA
exports.parseDegrees = function (data) {
    var options = {
        isNeedAccurateIds: true,
        baseIdOnLabel: 'DEGREE_DROPDOWN_ITEM',
        isNeedAlternateLastItem: true
    };
    return parseEnumsArray(data, false, options);
};

// CURRENT_JOBS_DROPDOWN_DATA
exports.parseCurrentJobs = function (data) {
    var parsedData = [];
    var limit = data.length;
    var i = 0;
    var obj;

    for (; i < limit; i++) {
        //obj = {
        //    id: uuid.v4(),
        //    title: data[i]
        //};
        obj = {
            id: sha1('JOB_TITLE_DROPDOWN_ITEM_' + i),
            title: data[i]
        };

        if (i === limit - 1) {
            obj.alternative = true;
        }

        parsedData.push(obj);
    }

    return [
        {
            id: sha1('JOB_TITLE_DROPDOWN_GROUP_Root'),
            name: 'JOB_TITLE_DROPDOWN_GROUP_Root',
            title: 'Root',
            type: 'group',
            items: parsedData
        }
    ];
};

/*exports.parseCurrentJobs = function (data) {
    var parsedData = [],
        itemArray = [],
        parsedItemArray = [],
        obj = {};
    for(var rootItem in data) {
        if(data.hasOwnProperty(rootItem)) {
            itemArray = data[rootItem];
            parsedItemArray = [];
            for(var j = 0, item; j < itemArray.length; j++) {
                item = itemArray[j];
                obj = {
                    id: sha1('JOBS_DROPDOWN_ITEM_' + rootItem + '_' + j),
                    name: 'JOBS_DROPDOWN_ITEM_' + rootItem + '_' + j,
                    title: item,
                    alternative: false
                };
                if(j === itemArray.length - 1) {
                    obj.alternative = true;
                }
                parsedItemArray.push(obj);
            }
            parsedData.push({
                id: sha1('JOBS_DROPDOWN_GOURP_' + rootItem),
                name: 'JOBS_DROPDOWN_GOURP_' + rootItem,
                title: rootItem,
                type: 'group',
                items: parsedItemArray
            });
        }
    }
    return parsedData;
    //return parseEnumsObject(data);
};*/

// ANNUAL_INCOME_DROPDOWN_DATA
exports.parseAnnualIncome = function (data) {
    return parseEnumsArray(data, false);
};

// COMPANY_SIZE_DROPDOWN_DATA
exports.parseCompanySize = function (data) {
    return parseEnumsArray(data, false);
};

// EXPERIENCE_DROPDOWN_DATA
exports.parseExperience = function (data) {
    return parseEnumsArray(data, false);
};

// EMPLOYEES_AMOUNTS_DROPDOWN_DATA
exports.parseEmployeeAmount = function (data) {
    return parseEnumsArray(data, false);
};

// EMPLOYMENTS_DROPDOWN_DATA
exports.parseEmployments = function (data) {
    return parseEnumsArray(data, true);
};

// VALUE_ASSESSMENTS_DROPDOWN_DATA
exports.parseValueAssessments = function (data) {
    return parseEnumsArray(data, true);
};

