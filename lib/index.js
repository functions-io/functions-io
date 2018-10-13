"use strict";

const core = require("functions-io-core");

var cacheListPreFilter = [];
var cacheListFilter = [];
var cacheListGateway = [];

//
//HANDLE MESSAGE
//
function createResponseErr(errCode, errMessage){
    let errObj = {};
    errObj.code = errCode;
    errObj.message = errMessage;
    return errObj;
}

//
//GATEWAY HANDLE MESSAGE
//
var gatewayHandleMessage = function(message, callBack){
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

module.exports.config = core.config;

module.exports.invokeFactory = core.buildInvokeFactory();

module.exports.addFilter = function(moduleOrModuleName){
    if (typeof(moduleOrModuleName) === "string"){
        cacheListFilter.push(require(moduleOrModuleName));
    }
    else{
        cacheListFilter.push(moduleOrModuleName);
    }
};

module.exports.addPreFilter = function(moduleOrModuleName){
    if (typeof(moduleOrModuleName) === "string"){
        cacheListPreFilter.push(require(moduleOrModuleName));
    }
    else{
        cacheListPreFilter.push(moduleOrModuleName);
    }
};

module.exports.addGateway = function(moduleOrModuleName, config){
    if (typeof(moduleOrModuleName) === "string"){
        var newGateway = require(moduleOrModuleName);
        if (config){
            newGateway.config = config;
        }
        newGateway.handleMessage = gatewayHandleMessage;
        cacheListGateway.push(require(moduleOrModuleName));
    }
    else{
        cacheListGateway.push(moduleOrModuleName);
    }
};

//extends core
module.exports.invokeFactory.preFilter = function(moduleName, moduleVersion, data, context, callBack){
    var i = -1;
    var message;
    
    function executeFilter(){
        try {
            i = i + 1;
            let currentFilter = cacheListPreFilter[i];
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
        if (cacheListPreFilter.length){
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

//extends core
module.exports.invokeFactory.filter = function(data, context, callBack){
    var i = -1;
    
    function executeFilter(){
        try {
            i = i + 1;
            let currentFilter = cacheListFilter[i];
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
        if (cacheListFilter.length){
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
//Load Filter
//
module.exports.loadFilterDelcaredInConfig = function(){
    let listFilter = module.exports.config.get("io.listFilter", {});
    let listKey = Object.keys(listFilter);

    for (var i = 0; i < listKey.length; i++){
        let key = listKey[i];
        let filter = listFilter[key];
        if (filter.enabled){
            if (filter.estage === "before"){
                module.exports.addPreFilter(filter.moduleName);
            }
            else{
                module.exports.addFilter(filter.moduleName);
            }
        }
    }
};

//
//Load Gateway
//
module.exports.loadGatewayDelcaredInConfig = function(){
    let listGateway = module.exports.config.get("io.listGateway", {});
    let listKey = Object.keys(listGateway);

    for (var i = 0; i < listKey.length; i++){
        let key = listKey[i];
        let gateway = listGateway[key];
        if (gateway.enabled){
            module.exports.addGateway(gateway.moduleName, gateway.config);
        }
    }
};

//
//START
//
module.exports.start = function(){
    this.loadFilterDelcaredInConfig();
    this.loadGatewayDelcaredInConfig();

    for (var i = 0; i < cacheListGateway.length; i ++){
        let gatewayObj = cacheListGateway[i];
        if (gatewayObj.start){
            cacheListGateway[i].start();
        }
    }
};

//
//STOP
//
module.exports.stop = function(){
    for (var i = 0; i < cacheListGateway.length; i ++){
        let gatewayObj = cacheListGateway[i];
        if (gatewayObj.stop){
            gatewayObj.stop();
        }
    }
};