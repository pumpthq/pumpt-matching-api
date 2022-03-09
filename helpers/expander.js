var Expander = function () {

    this.expandOne = function one(childPathName, projection, childCollectionName) {
        projection[childPathName] = {$arrayElemAt: ['$' + childPathName, 0]};

        return [{
            $lookup: {
                from        : childCollectionName || childPathName,
                foreignField: '_id',
                localField  : childPathName,
                as          : childPathName
            }
        }, {
            $project: projection
        }];
    };

    this.expandOneWithChildProjection = function (childPathName, projection, childProjection, childCollectionName) {
        var childKeys = Object.keys(childProjection);
        var itChildKeys = childKeys.length;
        var projection2;
        var key;

        projection2 = Object.assign({}, projection);
        projection[childPathName] = {$arrayElemAt: ['$' + childPathName, 0]};

        while (itChildKeys--) {
            key = childKeys[itChildKeys];
            childProjection[key] = '$' + childPathName + '.' + key;
        }

        projection2[childPathName] = childProjection;

        return [{
            $lookup: {
                from        : childCollectionName || childPathName,
                foreignField: '_id',
                localField  : childPathName,
                as          : childPathName
            }
        }, {
            $project: projection
        }, {
            $project: projection2
        }];
    };

    this.expandMany = function many(childPathName, projection, childCollectionName) {
        var projectionKeys = Object.keys(projection);
        var itKeys = projectionKeys.length;
        var groupObj = {_id: {}};
        var groupObjId = groupObj._id;
        var projectObj2 = {};
        var projectionKey;
        var projectObj1;

        while (itKeys--) {
            projectionKey = projectionKeys[itKeys];
            groupObjId[projectionKey] = '$' + projectionKey;

            projectObj2[projectionKey] = '$_id.' + projectionKey;
        }
        delete groupObjId[childPathName];
        groupObj[childPathName] = {$push: '$' + childPathName};

        projectObj2[childPathName] = 1;

        projectObj1 = Object.assign({}, projection);
        projectObj1[childPathName] = {$arrayElemAt: ['$' + childPathName, 0]};

        return [{
            $unwind: {
                path                      : '$' + childPathName,
                preserveNullAndEmptyArrays: true
            }
        }, {
            $lookup: {
                from        : childCollectionName || childPathName,
                foreignField: '_id',
                localField  : childPathName,
                as          : childPathName
            }
        }, {
            $project: projectObj1
        }, {
            $group: groupObj
        }, {
            $project: projectObj2
        }];
    };

    this.expandManyWithChildProjection = function (childPathName, projection, childProjection, childCollectionName) {
        var projectionKeys = Object.keys(projection);
        var childKeys = Object.keys(childProjection);
        var itChildKeys = childKeys.length;
        var itKeys = projectionKeys.length;
        var groupObj = {_id: {}};
        var groupObjId = groupObj._id;
        var projectObj2 = {};
        var projectObj1;
        var key;

        while (itKeys--) {
            key = projectionKeys[itKeys];
            groupObjId[key] = '$' + key;

            projectObj2[key] = '$_id.' + key;
        }
        delete groupObjId[childPathName];

        while (itChildKeys--) {
            key = childKeys[itChildKeys];
            childProjection[key] = '$' + childPathName + '_docs.' + key;
        }
        groupObj[childPathName] = {$push: childProjection};

        projectObj2[childPathName] = 1;

        projectObj1 = Object.assign({}, projection);
        projectObj1[childPathName] = {$arrayElemAt: ['$' + childPathName, 0]};

        return [{
            $unwind: {
                path                      : '$' + childPathName,
                preserveNullAndEmptyArrays: true
            }
        }, {
            $lookup: {
                from        : childCollectionName || childPathName,
                foreignField: '_id',
                localField  : childPathName,
                as          : childPathName + '_docs'
            }
        }, {
            $project: projectObj1
        }, {
            $group: groupObj
        }, {
            $project: projectObj2
        }];
    };
};

var expander = new Expander();

module.exports = expander;
