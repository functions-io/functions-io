"use strict";

module.category = "sys";
module.name = "sys.security.token.validate";
module.summary = "validateToken";
module.validatePermission = false;
module.config = {
    privateKey:"key"
};

module.input = {
    token:{type:"string", required:true}
};

var jwt = require('jsonwebtoken');
module.exports = function(context, message, callBack){
    jwt.verify(message.token, module.config.privateKey, callBack);
};