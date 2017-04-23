"use strict";

module.category = "sys";
module.name = "sys.security.login";
module.summary = "login";
module.config = {
    loginProvider:"sys.security.provider.login.sample"
};

module.input = {
    userName:{type:"string", required:true},
    password:{type:"string", required:true}
};

module.output = {
    token:{type:"string", required:true}
}

module.exports = function(context, message, callBack){
    console.log("login => ");
    console.log(message);
    context.invoke(null, module.config.loginProvider, null, message, function(err, user){
        if (err){
            callBack(err);
        }
        else{
            context.invoke(null, "sys.security.token.generate", null, user, callBack);
        }
    });
};