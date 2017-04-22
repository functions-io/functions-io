"use strict";

module.category = "sys";
module.name = "sys.security.validateToken";
module.summary = "validateToken";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    console.log("sys.security.validateToken - token => " + message.token);
    callBack(null, {user:{id:1, name:"user1"}});
};