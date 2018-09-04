"use strict";

module.category = "sys.security";
module.name = "sys.security.provider.token.validate";
module.summary = "validateToken";
module.validatePermission = false;
module.isPrivate = false;
module.config = {
    privateKey:"key"
};

module.input = {
    token:{type:"string", required:true}
};

var jwt = require("jsonwebtoken");
module.exports = function(context, message, callBack){
    jwt.verify(message.token, module.config.privateKey, callBack);
};