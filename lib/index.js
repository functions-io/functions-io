"use strict";

const core = require("functions-io-core");
const gatewayHTTP = require("@functions-io-modules/functions-io-modules-gateway-http");

var preFilters = [];
var filters = [];

module.exports.config = {};
module.exports.config.filterAuthenticationEnabled = false;
module.exports.config.filterAuthorizationEnabled = false;
module.exports.config.listRegistry = [
    {url:"http://127.0.0.1:9080"},
    {url:"https://registry.npmjs.org"}
];

//before buildInvokeFactory
core.config.moduleRegistryDataStore = core.createHttpNpmDataStore();
core.config.moduleRegistryDataStore.config.listRegistry = module.exports.config.listRegistry;

module.exports.invokeFactory = core.buildInvokeFactory();
module.exports.gatewayHTTP = gatewayHTTP;

module.exports.addFilter = function(moduleOrModuleName){
    if (typeof(moduleOrModuleName) === "string"){
        filters.push(require(moduleOrModuleName));
    }
    else{
        filters.push(moduleOrModuleName);
    }
};

module.exports.addPreFilter = function(moduleOrModuleName){
    if (typeof(moduleOrModuleName) === "string"){
        preFilters.push(require(moduleOrModuleName));
    }
    else{
        preFilters.push(moduleOrModuleName);
    }
};

module.exports.addFilter("@functions-io-modules/security.input.filter");

module.exports.invokeFactory.preFilter = function(moduleName, moduleVersion, data, context, callBack){
    var i = -1;
    var message;
    
    function executeFilter(){
        try {
            i = i + 1;
            let currentFilter = preFilters[i];
            if (currentFilter){
                currentFilter(message, context)
                    .then(function(){
                        executeFilter();
                    },function(errInvoke){
                        callBack(errInvoke);
                    });
            }
            else{
                callBack(null, null);
            }
        }
        catch (errTry) {
            callBack(errTry);
        }
    }
    
    try {
        if (preFilters.length){
            message = {};
            message.moduleName = moduleName;
            message.moduleVersion = moduleVersion;
            executeFilter();
        }
        else{
            callBack(null, null);
        }        
    }
    catch (errTry) {
        callBack(errTry);
    }
};

module.exports.invokeFactory.filter = function(data, context, callBack){
    var i = -1;
    
    function executeFilter(){
        try {
            i = i + 1;
            let currentFilter = filters[i];
            if (currentFilter){
                currentFilter(data, context)
                    .then(function(){
                        executeFilter();
                    },function(errInvoke){
                        callBack(errInvoke);
                    });
            }
            else{
                callBack(null, null);
            }
        }
        catch (errTry) {
            callBack(errTry);
        }
    }

    try {
        if (filters.length){
            executeFilter();
        }
        else{
            callBack(null, null);
        }        
    }
    catch (errTry) {
        callBack(errTry);
    }
};



//
//START
//
module.exports.start = function(callBack){
    if (module.exports.config.filterAuthenticationEnabled){
        module.exports.addPreFilter("@functions-io-modules/security.authentication.filter");
    }
    if (module.exports.config.filterAuthorizationEnabled){
        module.exports.addFilter("@functions-io-modules/security.authorization.filter");
    }
    gatewayHTTP.start(callBack);
};



//
//STOP
//
module.exports.stop = function(){
    //gatewayHTTP.start(callBack);
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
