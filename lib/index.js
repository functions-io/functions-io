const core = require("functions-io-core");
const gatewayHTTP = require("functions-io-gateway-http");
const invokeFactory = core.buildInvokeFactory();
const validateInput = require("./validateInput");
const oauth = require("./security/oauth");

//core.config.log.level = core.config.log.levels.DEBUG;

module.exports.invokeFactory = invokeFactory;
module.exports.gatewayHTTP = gatewayHTTP;

module.exports.oauth = {};
module.exports.oauth.enabled = true;
module.exports.oauth.config = {};
module.exports.oauth.config.login = {};
module.exports.oauth.config.login.moduleName = "@functions-io-modules/security.login.mongo";
//module.exports.oauth.config.login.moduleName = "@functions-io-labs/security.login";
module.exports.oauth.config.login.moduleVersion = "1.*";
module.exports.oauth.config.haspermission = {};
module.exports.oauth.config.haspermission.moduleName = "@functions-io-labs/security.haspermission";
module.exports.oauth.config.haspermission.moduleVersion = "1.*";
module.exports.oauth.config.secretOrPrivateKey = "aaaa";
module.exports.oauth.config.opt = {};
module.exports.oauth.config.opt.algorithm = "HS256";
module.exports.oauth.config.opt.expiresIn = 3600;
module.exports.oauth.config.opt.issuer = "functions-io";

//module oauth
module.exports.oauth.module = oauth;
module.exports.oauth.module.config = module.exports.oauth.config;
module.exports.oauth.module.invokeFactory = module.exports.invokeFactory;

module.exports.invokeFactory.validate = function(moduleObj, data, context, callBack){
    let errValidateInput = validateInput(moduleObj, data);
    
    if (errValidateInput){
        callBack(errValidateInput);
    }
    else{
        if (module.exports.oauth.enabled && module.exports.oauth.module){
            if ((moduleObj.__manifest) && (moduleObj.__manifest.packageObj) && (moduleObj.__manifest.packageObj.public)){
                callBack();
            }
            else{
                //message.context.security.type = values[0];
                //message.context.security.credentials = values[1] || null;
                if (context.security.credentials){
                    module.exports.oauth.module.verifyTokenJWT(context.security.credentials, function(errVerifyToken, userObj){
                        if (errVerifyToken){
                            errVerifyToken.code = 401;
                            callBack(errVerifyToken);
                        }
                        else{
                            if (userObj){
                                context.security.user = userObj;
                                
                                Object.freeze(context.security); //security
                                Object.freeze(context.security.user); //security

                                //console.log("user => " , context.security.user);

                                if (module.exports.oauth.config.haspermission){
                                    if ((context.security.user.roles) && (context.security.user.roles.length)){
                                        module.exports.oauth.module.haspermission(context.security.user.roles, moduleObj.__manifest.name, context, function(errPermission, status){
                                            if (errPermission){
                                                callBack(errPermission);
                                            }
                                            else{
                                                if (status){
                                                    callBack(null, userObj);
                                                }
                                                else{
                                                    callBack({code:403, message:"Forbidden", data:{moduleName:moduleObj.__manifest.name}});
                                                }
                                            }
                                        });
                                    }
                                    else{
                                        callBack({code:403, message:"Forbidden"});
                                    }
                                }
                                else{
                                    callBack(null, userObj);
                                }
                            }
                            else{
                                callBack({code:401, message:"Unauthorized"});
                            }
                        }
                    });
                }
                else{
                    callBack({code:401, message:"Unauthorized"});
                }
            }
        }
        else{
            callBack();
        }
    }
};



//
//START
//
module.exports.start = function(callBack){
    gatewayHTTP.start(callBack);
};



//
//HANDLE MESSAGE
//
function createResponseErr(errCode, errMessage){
    let errObj = {};
    errObj.code = errCode;
    errObj.message = errMessage;
    return errObj;
}
module.exports.gatewayHTTP.externalHandleEvent.handleMessage = function(message, callBack){
    try {
        if (message){
            if (message.method){
                module.exports.invokeFactory.invokeMessage(message, callBack);
            }
            else{
                if (module.exports.oauth.enabled && (message.context.http.url.indexOf("/oauth2/token") > -1) && module.exports.oauth.module && message.context.http && module.exports.oauth.config.login){
                    if (module.exports.oauth.module){
                        module.exports.oauth.module.login(message, callBack);
                    }
                    else{
                        callBack(createResponseErr(-32601, "Method not found"));
                    }
                }
                else{
                    callBack(createResponseErr(-32601, "Method not found"));
                }
            }
        }
        else{
            callBack(createResponseErr(-32600, "Invalid Request"));
        }        
    }
    catch (errorTry) {
        callBack(createResponseErr(-32603, errorTry.message));
    }
};
