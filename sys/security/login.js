"use strict";

module.category = "sys.security";
module.name = "sys.security.login";
module.summary = "login";
module.config = {
    loginProvider:"sys.security.provider.login.mongo",
    generateTokenProvider:"sys.security.provider.token.generate"
};

module.input = {
    userName:{type:"string", required:true},
    password:{type:"string", required:true}
};

module.output = {
    token:{type:"string", required:true}
};

module.exports = function(context, message, callBack){
    context.invoke(null, module.config.loginProvider, null, message, function(err, user){
        if (err){
            callBack(err);
        }
        else{
            context.invoke(null, module.config.generateTokenProvider, null, user, callBack);
        }
    });
};