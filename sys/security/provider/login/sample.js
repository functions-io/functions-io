"use strict";

module.category = "sys";
module.name = "sys.security.provider.login.sample";
module.summary = "login provider";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    var user = {};
    user.name = "admin";
    user.sub = "admin@admin.com";
    
    callBack(null, user);
};