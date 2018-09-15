const jwt = require("jsonwebtoken");

function createObjErr(description){
    let errObj = {};
    errObj.error = "Server error";
    errObj.error_description = description;
    //errObj.error_uri = "";
    return errObj;
}

module.exports.invokeFactory = null;
module.exports.config = null;

module.exports.generateTokenJWT = function(userObj){
    let payload = {};

    payload.sub = userObj.id || userObj.email;
    payload.name = userObj.name;
    payload.iat = Math.floor(Date.now() / 1000);
    payload.email = userObj.email;
    payload.roles = userObj.roles;
    //payload.scope = ""; //https://tools.ietf.org/html/draft-ietf-oauth-v2-30#section-3.3
    //payload.roles = [];
    //payload.permissions = [];
    //payload.groups = [];
    
    //payload.jti = 1; //JWT ID

    return jwt.sign(payload, module.exports.config.secretOrPrivateKey, module.exports.config.opt);
};

module.exports.verifyTokenJWT = function(tokenJWT, callBack){
    return jwt.verify(tokenJWT, module.exports.config.secretOrPrivateKey, module.exports.config.opt, callBack);
};

module.exports.generateResponseOauth = function(tokenJWT){
    let responseObj = {};
    responseObj.access_token = tokenJWT;
    responseObj.token_type = "bearer";
    //responseObj.expires_in = config.expires;
    //responseObj.refresh_token = "IwOGYzYTlmM2YxOTQ5MGE3YmNmMDFkNTVk";
    //responseObj.scope = message.scope;
    return responseObj;
};

//{"grant_type":"password","username": "user@example.com","password": "pwd","audience": "https://someapi.com/api", "scope": "read:sample", "client_id": "YOUR_CLIENT_ID", "client_secret": "YOUR_CLIENT_SECRET"}

module.exports.login = function(message, callBack){
    try {
        let responseObj = {};
        
        module.exports.invokeFactory.invokeAsync(module.exports.config.login.moduleName, module.exports.config.login.moduleVersion, message.params, message.context)
            .then(function(userObj){
                if (userObj){
                    responseObj.body = JSON.stringify(module.exports.generateResponseOauth(module.exports.generateTokenJWT(userObj)));
                    responseObj.statusCode = 200;
                }
                else{
                    responseObj.statusCode = 401;
                    responseObj.body = "Unauthorized";
                }
                callBack(null, responseObj);
            },function(errInvoke){
                let errObj = createObjErr(errInvoke.message);
                responseObj.body = JSON.stringify(errObj);
                responseObj.statusCode = 500;

                callBack(null, responseObj);
            });
    }
    catch (errTry) {
        let responseObj = {};
        let errObj = createObjErr(errTry.message);
        responseObj.body = JSON.stringify(errObj);
        responseObj.statusCode = 500;

        callBack(null, responseObj);
    }
};

module.exports.haspermission = function(roles, permission, context, callBack){
    try {
        let message = {};
        message.roles = roles;
        message.permission = permission;
        
        module.exports.invokeFactory.invokeAsync(module.exports.config.haspermission.moduleName, module.exports.config.haspermission.moduleVersion, message, context)
            .then(function(status){
                callBack(null, status);
            }, function(errInvoke){
                callBack(errInvoke);
            });
    }
    catch (errTry) {
        let responseObj = {};
        let errObj = createObjErr(errTry.message);
        responseObj.body = JSON.stringify(errObj);
        responseObj.statusCode = 500;

        callBack(null, responseObj);
    }
};