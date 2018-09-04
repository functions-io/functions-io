"use strict";

module.category = "sys.security";
module.name = "sys.security.provider.userRoles.mongo";
module.summary = "user provider";
module.validatePermission = false;
module.isPrivate = true;
module.config = {
    collectionName:"security.user",
    rolesField:"roles"
};

module.exports = function(context, message, callBack){
    var ObjectId = require("mongodb").ObjectID;
    var filter = {};
    var fields = {};

    filter._id = new ObjectId(message._id);
    fields[module.config.rolesField] = true;
    
    context.invoke(null, "sys.db.findOne", null, {objectName:module.config.collectionName, filter:filter, fields:fields}, function(err, data){
        if (err){
            callBack(err);
        }
        else{
            callBack(null, data[module.config.rolesField]);
        }
    });
};