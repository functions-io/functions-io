"use strict";

module.category = "sys.security";
module.name = "sys.security.provider.checkPermission.mongo";
module.summary = "checkPermission provider";
module.validatePermission = false;
module.isPrivate = true;
module.config = {
    collectionName:"security.roles",
    permissionsField:"permissions"
};

module.exports = function(context, message, callBack){
    var filter = {};
    var fields = {};

    filter._id = {};
    filter._id["$in"] = message.roles;
    filter.permissions = message.permission;
    filter[module.config.permissionsField] = message.permission;
    fields["_id"] = true;
    
    context.invoke(null, "sys.db.findOne", null, {objectName:module.config.collectionName, filter:filter, fields:fields}, function(err, data){
        if (err){
            callBack(err);
        }
        else{
            if (data){
                callBack(null, true);
            }
            else{
                callBack(null, false);
            }
        }
    });
};