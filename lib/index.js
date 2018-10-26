"use strict";

const core = require("functions-io-core");

var cacheListPreFilter = [];
var cacheListFilter = [];
var cacheListGateway = [];
var cacheDataSourceDriver = {};

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

module.exports.configDataSource = core.createConfig("dataSource");

module.exports.invokeFactory = core.buildInvokeFactory();

module.exports.addFilter = function(moduleOrModuleName, config){
    if (typeof(moduleOrModuleName) === "string"){
        let newFilter = require(moduleOrModuleName);
        if (config){
            newFilter.config = config;
        }
        cacheListFilter.push(newFilter);
        core.log.info("functions-io", "loadFilter", {moduleName:moduleOrModuleName});
    }
    else{
        cacheListFilter.push(moduleOrModuleName);
    }
};

module.exports.addPreFilter = function(moduleOrModuleName, config){
    if (typeof(moduleOrModuleName) === "string"){
        let newFilter = require(moduleOrModuleName);
        if (config){
            newFilter.config = config;
        }
        cacheListPreFilter.push(newFilter);
        core.log.info("functions-io", "loadPreFilter", {moduleName:moduleOrModuleName});
    }
    else{
        cacheListPreFilter.push(moduleOrModuleName);
    }
};

module.exports.addGateway = function(moduleOrModuleName, config){
    if (typeof(moduleOrModuleName) === "string"){
        let newGateway = require(moduleOrModuleName);
        if (config){
            newGateway.config = config;
        }
        newGateway.handleMessage = gatewayHandleMessage;
        cacheListGateway.push(require(moduleOrModuleName));
        core.log.info("functions-io", "loadGateway", {moduleName:moduleOrModuleName});
    }
    else{
        cacheListGateway.push(moduleOrModuleName);
    }
};

module.exports.addDataSourceDriver = function(driverName, moduleOrModuleName, config){
    if (typeof(moduleOrModuleName) === "string"){
        let newDataSourceDriver = require(moduleOrModuleName);
        if (config){
            newDataSourceDriver.config = config;
        }
        cacheDataSourceDriver[driverName] = newDataSourceDriver;
        core.log.info("functions-io", "loadDataSourceDriver", {moduleName:moduleOrModuleName});
    }
    else{
        cacheDataSourceDriver[driverName] = moduleOrModuleName;
    }
};

module.exports.getDataSourceFromConfig = function(dataSourceConfig){
    return new Promise(function(resolve, reject){
        try {
            if (dataSourceConfig){
                let dataSourceDriver = cacheDataSourceDriver[dataSourceConfig.type];
                if (dataSourceDriver){
                    return dataSourceDriver.getDataSource(dataSourceConfig.config);
                }
                else{
                    reject("DataSource " + dataSourceConfig.type + " not found");
                }
            }
            else{
                reject("DataSource not found");
            }
        }
        catch (errTry) {
            reject(errTry);
        }
    });
};

//extends core
module.exports.invokeFactory.getDataSource = function(moduleName, moduleVersion, context, nameDataSource){
    return new Promise(function(resolve, reject){
        let scopeName;
        try {
            let dataSourceConfig;

            dataSourceConfig = module.exports.configDataSource.get(moduleName + "/" + nameDataSource);
            if (dataSourceConfig){
                return module.exports.getDataSourceFromConfig(dataSourceConfig);
            }

            if (moduleName.substring(0,1) === "@"){
                scopeName = moduleName.substring(0, moduleName.indexOf("/"));
            }
            else{
                scopeName = "@default";
            }

            dataSourceConfig = module.exports.configDataSource.get(scopeName + "/" + nameDataSource);
            if (dataSourceConfig){
                return module.exports.getDataSourceFromConfig(dataSourceConfig);
            }
        }
        catch (errTry) {
            reject(errTry);
        }
    });
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
                module.exports.addPreFilter(filter.moduleName, filter.config);
            }
            else{
                module.exports.addFilter(filter.moduleName, filter.config);
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
            try {
                module.exports.addGateway(gateway.moduleName, gateway.config);
            }
            catch (errTry){
                console.error("loadGatewayDelcaredInConfig", key, errTry);
            }
        }
    }
};

//
//Load DataSourceDriver
//
module.exports.loadDataSourceDriverDelcaredInConfig = function(){
    let listDataSourceDriver = module.exports.config.get("io.listDataSourceDriver", {});
    let listKey = Object.keys(listDataSourceDriver);

    for (var i = 0; i < listKey.length; i++){
        let key = listKey[i];
        let dataSourceDriver = listDataSourceDriver[key];
        if (dataSourceDriver.enabled){
            try {
                module.exports.addDataSourceDriver(key, dataSourceDriver.moduleName, dataSourceDriver.config);
            }
            catch (errTry){
                console.error("loadDataSourceDriverDelcaredInConfig", key, errTry);
            }
        }
    }
};

//
//START
//
module.exports.start = function(){
    this.loadFilterDelcaredInConfig();
    this.loadGatewayDelcaredInConfig();
    this.loadDataSourceDriverDelcaredInConfig();

    //start gateways
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
    //stop gateway
    for (let i = 0; i < cacheListGateway.length; i ++){
        let gatewayObj = cacheListGateway[i];
        if (gatewayObj.stop){
            gatewayObj.stop();
        }
    }

    //stop dataSourceDriver
    let listDataSourceDriverKeys = Object.keys(cacheDataSourceDriver);
    for (let i = 0; i < listDataSourceDriverKeys.length; i++){
        let key = listDataSourceDriverKeys[i];
        let dataSourceDriver = cacheDataSourceDriver[key];
        if (dataSourceDriver){
            try {
                dataSourceDriver.close();
            }
            catch (errTry){
                console.error("stop", key, errTry);
            }
        }
    }
};