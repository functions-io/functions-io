"use strict";

module.category = "sys";
module.name = "sys.security.provider.role.sample";
module.summary = "role provider";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    console.log("sys.security.provider.role.sample - " + message.user.name + " - " + message.permission);
    callBack(null, true);
};