const core = require("functions-io-core");
const gatewayHTTP = require("functions-io-gateway-http");
const invokeFactory = core.buildInvokeFactory();

module.exports.invokeFactory = invokeFactory;
module.exports.gatewayHTTP = gatewayHTTP;
module.exports.config = {};
module.exports.config.preFilters = [
    {moduleName:"@functions-io-modules/security.authentication.filter", moduleVersion:"1.*", enabled:true}
];
module.exports.config.filters = [
    {moduleName:"@functions-io-modules/security.input.filter", moduleVersion:"1.*", enabled:true}
];
/*
module.exports.config.filters = [
    {moduleName:"@functions-io-modules/security.input.filter", moduleVersion:"1.*", enabled:true},
    {moduleName:"@functions-io-modules/security.authorization.filter", moduleVersion:"1.*", enabled:true}
];
*/

module.exports.invokeFactory.preValidate = function(moduleName, moduleVersion, data, context, callBack){
    var message;
    var filters;

    function executeFilter(){
        try {
            let currentFilter = filters.pop();
            if (currentFilter){
                if (currentFilter.enabled){
                    context.invokeAsync(currentFilter.moduleName, currentFilter.moduleVersion, message)
                        .then(function(){
                            executeFilter();
                        },function(errInvoke){
                            callBack(errInvoke);
                        });
                }
                else{
                    executeFilter();
                }
            }
            else{
                callBack(null, null);
            }
        }
        catch (errTry) {
            callBack(errTry);
        }
    }

    if (module.exports.config.preFilters.find(function(item){return item.moduleName === moduleName;})){
        callBack(null, null);
    }
    else{
        message = {};
        message.moduleName = moduleName;
        message.moduleVersion = moduleVersion;
        filters = module.exports.config.preFilters.slice();
    
        executeFilter();
    }
};

module.exports.invokeFactory.validate = function(moduleObj, data, context, callBack){
    var message;
    var filters;

    function executeFilter(){
        try {
            let currentFilter = filters.pop();
            if (currentFilter){
                if (currentFilter.enabled){
                    context.invokeAsync(currentFilter.moduleName, currentFilter.moduleVersion, message)
                        .then(function(){
                            executeFilter();
                        },function(errInvoke){
                            callBack(errInvoke);
                        });
                }
                else{
                    executeFilter();
                }
            }
            else{
                callBack(null, null);
            }
        }
        catch (errTry) {
            callBack(errTry);
        }
    }

    message = {};
    message.manifest = moduleObj.__manifest;
    message.body = data;
    
    filters = module.exports.config.filters.slice();

    executeFilter();
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
                callBack(createResponseErr(-32601, "Method not found"));
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
