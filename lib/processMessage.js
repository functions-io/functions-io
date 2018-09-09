module.exports.invokeFactory = null;

module.exports.user = {};
module.exports.user.login = null;
module.exports.oauth = {};
module.exports.oauth.login = null;
module.exports.oauth.config = {};

function createResponseErr(errCode, errMessage){
    let errObj = {};
    errObj.code = errCode;
    errObj.message = errMessage;
    return errObj;
}

module.exports.process = function(message, callBack){
    try {
        if (message){
            if (message.method){
                module.exports.invokeFactory.invokeMessage(message, callBack);
            }
            else{
                if ((message.context.http) && (message.context.http.url.indexOf("/oauth2/token") > -1)){
                    if ((module.exports.user.login) && (module.exports.oauth.login)){
                        module.exports.oauth.login(module.exports.oauth.config, module.exports.user.login, message, callBack);
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