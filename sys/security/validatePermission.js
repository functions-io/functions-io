"use strict";

module.category = "sys";
module.name = "sys.security.validatePermission";
module.summary = "validatePermission";
module.validatePermission = false;
module.config = {
    roleProvider:"sys.security.provider.role.sample"
};

module.input = {
    permission:{type:"string", required:true}
};

module.exports = function(context, message, callBack){
    if (context === undefined){
        context = {};
    }
    if (context.header === undefined){
        context.header = {};
    }
    if (context.header.security === undefined){
        context.header.security = {};
    }
    if (context.header.security.acessToken === undefined){
        context.header.security.acessToken = "";
    }
    
    context.invoke(null, "sys.security.validateToken", null, {token:context.header.security.acessToken}, function(errValidateToken, resultValidateToken){
        if (errValidateToken){
            callBack(errValidateToken);
        }
        else{
            context.invoke(null, module.config.roleProvider, null, {user:resultValidateToken.user, permission:message.permission}, function(errValidatePermission, resultValidatePermission){
                if (errValidatePermission){
                    callBack(errValidatePermission);
                }
                else{
                    context.header.security.user = resultValidateToken.user;
                    callBack(null, resultValidateToken.user);
                }
            });
        }
    });
};