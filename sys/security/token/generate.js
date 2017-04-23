"use strict";

module.category = "sys";
module.name = "sys.security.token.generate";
module.summary = "generateToken";
module.validatePermission = false;
module.isPrivate = true;
module.config = {
    algorithm:"HS256",
    privateKey:"key"
};

var jwt = require('jsonwebtoken');
module.exports = function(context, message, callBack){
    var tokenSign;

    tokenSign = jwt.sign(message, module.config.privateKey, {algorithm: module.config.algorithm});

    callBack(null, tokenSign);
};