const core = require("functions-io-core");
const gatewayHTTP = require("functions-io-gateway-http");
const invokeFactory = core.buildInvokeFactory();
const validate = require("./validate");
const oauth = require("./security/oauth");

//core.config.log.level = core.config.log.levels.DEBUG;

module.exports.invokeFactory = invokeFactory;
module.exports.gatewayHTTP = gatewayHTTP;

module.exports.oauth = {};
module.exports.oauth.module = oauth;
module.exports.oauth.config = {};
module.exports.oauth.config.login = {};
module.exports.oauth.config.login.moduleName = "@functions-io-labs/security.login";
module.exports.oauth.config.login.moduleVersion = "1.0.0";
module.exports.oauth.config.secretOrPrivateKey = "aaaa";
module.exports.oauth.config.opt = {};
module.exports.oauth.config.opt.algorithm = "HS256";
module.exports.oauth.config.opt.expiresIn = 3600;
module.exports.oauth.config.opt.issuer = "functions-io";

module.exports.invokeFactory.validate = validate;



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
                if ((message.context.http) && (message.context.http.url.indexOf("/oauth2/token") > -1)){
                    if (module.exports.oauth.module){
                        module.exports.oauth.module.config = module.exports.oauth.config;
                        module.exports.oauth.module.invokeFactory = module.exports.invokeFactory;
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
