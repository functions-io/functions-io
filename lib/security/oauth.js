const jwt = require("jsonwebtoken");

module.exports.generateTokenJWT = function(config, userObj){
    let payload = {};

    payload.sub = userObj.id || userObj.email;
    payload.name = userObj.name;
    payload.iat = Math.floor(Date.now() / 1000);
    payload.email = userObj.email;
    //payload.scope = "";
    //payload.roles = [];
    //payload.permissions = [];
    //payload.groups = [];
    
    //payload.jti = 1; //JWT ID

    return jwt.sign(payload, config.secretOrPrivateKey, config.opt);
};

module.exports.verifyTokenJWT = function(config, tokenJWT, callBack){
    return jwt.verify(tokenJWT, config.secretOrPrivateKey, config.opt, callBack);
};

module.exports.generateResponseOauth = function(config, tokenJWT){
    let responseObj = {};
    responseObj.access_token = tokenJWT;
    responseObj.token_type = "bearer";
    responseObj.expires_in = config.expires;
    //responseObj.refresh_token = "IwOGYzYTlmM2YxOTQ5MGE3YmNmMDFkNTVk";
    //responseObj.scope = message.scope;
    return responseObj;
};

module.exports.login = function(config, userLogin, message, callBack){
    try {
        userLogin(message.params.username, message.params.password, message.context, function(errLogin, userObj){
            let responseObj = {};
            if (errLogin){
                let errObj = {};
                
                errObj.error = "Server error";
                errObj.error_description = errLogin.message;
                //errObj.error_uri = "";
                
                responseObj.body = JSON.stringify(errObj);
                responseObj.statusCode = 500;
            }
            else{
                if (userObj){
                    responseObj.body = JSON.stringify(module.exports.generateResponseOauth(config, module.exports.generateTokenJWT(config, userObj)));
                    responseObj.statusCode = 200;
                }
                else{
                    responseObj.statusCode = 401;
                    responseObj.body = "Unauthorized";
                }
            }
            callBack(null, responseObj);
        });
    }
    catch (errTry) {
        let responseObj = {};
        let errObj = {};
        
        errObj.error = "Server error";
        errObj.error_description = errTry.message;
        //errObj.error_uri = "";
        
        responseObj.body = JSON.stringify(errObj);
        responseObj.statusCode = 500;

        callBack(null, responseObj);
    }
};