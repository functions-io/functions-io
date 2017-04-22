"use strict";

module.category = "sys";
module.name = "sys.security.hasPermission";
module.summary = "hasPermission";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    console.log("sys.security.hasPermission - " + message.user.name + " - " + message.permission);
    callBack(null, true);
};