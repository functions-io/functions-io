"use strict";

var vm = require("vm");

var wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

var FunctionsFactory = function(){
    this.isGenerateStatistics = true;
    this.listFunctionManager = {};

    this.addFunctionManagerFromCode = function(code, opt){
        return this.addFunctionManager(this.buildFunctionManagerFromCode(code, opt));
    };

    this.addFunctionManager = function(functionManager){
        if (functionManager){
            //warning modify - getFunctionManager
            var key = (functionManager.stage || "") + "-" + functionManager.name + "-" + (functionManager.version || "");
            
            this.listFunctionManager[key] = functionManager;

            console.info("Function " + key + " loaded");

            return functionManager;
        }
        else{
            return null;
        }
    };

    this.buildFunctionManagerFromCode = function(code, opt){
        return this.buildFunctionManager(this.compile(code), opt);
    };

    this.buildFunctionManager = function(moduleInstance, opt){
        var functionManager;
        
        functionManager = {};
        
        functionManager.module = moduleInstance;

        if (!(functionManager.module.exports)){
            return null;
        }

        if ((opt) && (opt.stage)){
            functionManager.stage = opt.stage;
        }
        else{
            functionManager.stage = functionManager.module.stage;
        }
        
        if (functionManager.module.name){
            functionManager.name = functionManager.module.name;
        }
        else{
            if (opt){
                functionManager.name = opt.name
            }
            else{
                throw new RangeError("Parameter name required");
            }
        }

        functionManager.version = functionManager.module.version;
        
        functionManager.hits = {};
        functionManager.hits.success = 0;
        functionManager.hits.error = 0;
        functionManager.hits.abort = 0;
        functionManager.hits.lastResponseTime = 0;
        functionManager.hits.avgResponseTime = 0;
        functionManager.hits.maxResponseTime = 0;
        functionManager.hits.minResponseTime = 0;

        return functionManager;
    };

    this.compile = function(code){
        var codeWrapper = wrapper[0] + code + wrapper[1];
        var compiledWrapper = vm.runInThisContext(codeWrapper, {
            filename: "functions",
            lineOffset: 1,
            displayErrors: true
        });

        var newModule = {};
        newModule.exports = {};

        compiledWrapper(newModule.exports, require, newModule, "functions", "functions");

        return newModule;
    };

    this.getFunctionManager = function(functionStage, functionName, functionVersion){
        var functionManager;
        
        if (functionStage === null){
            functionStage = "";
        }
        if (!(functionName)){
            throw new RangeError("Parameter required");
        }
        if ((functionVersion === undefined) || (functionVersion === undefined)){
            functionVersion = "";
        }

        //warning modify - addFunctionManager
        var key = functionStage + "-" + functionName + "-" + functionVersion;

        functionManager = this.listFunctionManager[key];
        if (functionManager === undefined){
            if (functionStage !== ""){
                functionManager = this.listFunctionManager["-" + functionName + "-" + functionVersion];
                if (functionManager === undefined){
                    return null;
                }
                else{
                    functionManager;
                }
            }
            else{
                return null;
            }
        }
        else{
            return functionManager;
        }
    };

    this.invokeMessage = function(messageRequest, callBack){
        this.invoke(messageRequest.method, messageRequest.version, messageRequest.stage, messageRequest.params, messageRequest.header, function(errInvoke, resultInvoke){
            var messageResponse = {};
            
            messageResponse.id = messageRequest.id;

            if (errInvoke){
                messageResponse.result = null;
                messageResponse.error = errInvoke;
            }
            else{
                messageResponse.result = resultInvoke;
                messageResponse.error = null;
            }

            callBack(messageResponse);
        });
    };

    this.invoke = function(functionStage, functionName, functionVersion, message, context, callBack){
        var functionManager;
        
        if (!(functionName)){
            throw new RangeError("Parameter required");
        }
        if (!(callBack instanceof Function)){
            throw new RangeError("Parameter callBack required");
        }

        if (functionName === "sys.catalog"){
            callBack(null, this.getCatalog());
            return;
        }

        functionManager = this.getFunctionManager(functionStage, functionName, functionVersion);

        if (functionManager){
            //call function
            if (this.isGenerateStatistics === true){
                (function(){
                    try {
                        var diffTime = 0;
                        var start = process.hrtime();
                        functionManager.module.exports(context, message, function(errFunc, dataFunc){
                            diffTime = (process.hrtime(start)[1] / 1000);
                            if (errFunc){
                                functionManager.hits.error ++;
                            }
                            else{
                                functionManager.hits.success ++;
                            }
                            if (functionManager.hits.lastResponseTime === 0){
                                functionManager.hits.avgResponseTime = diffTime;
                            }
                            else{
                                functionManager.hits.avgResponseTime = ((diffTime + functionManager.hits.lastResponseTime) / 2);
                            }
                            if (diffTime > functionManager.hits.maxResponseTime){
                                functionManager.hits.maxResponseTime = diffTime;
                            }
                            if ((functionManager.hits.minResponseTime === 0) || (diffTime < functionManager.hits.minResponseTime)){
                                functionManager.hits.minResponseTime = diffTime;
                            }
                            functionManager.hits.lastResponseTime = diffTime;
                            
                            callBack(errFunc, dataFunc);
                        });
                    } catch (errorCall) {
                        functionManager.hits.abort ++;
                    }
                })();
            }
            else{
                functionManager.module.exports(context, message, callBack);
            }
        }
        else{
            throw new ReferenceError("Function not found");
        }
    };

    this.getCatalogCount = function(){
        return Object.keys(this.listFunctionManager).length;
    };
    
    this.getCatalog = function(){
        var listCatalog = [];
        var item;
        var keys;
        var newItemCatalog;

        keys = Object.keys(this.listFunctionManager);
        for (var i = 0; i < keys.length; i++){
            item = this.listFunctionManager[keys[i]];
            newItemCatalog = {};
            newItemCatalog.stage = item.stage;
            newItemCatalog.name = item.name;
            newItemCatalog.version = item.version;
            newItemCatalog.input = item.module.input;
            newItemCatalog.output = item.module.output;
            if (item.module.info){
                newItemCatalog.info = item.module.info;
            }
            else{
                newItemCatalog.info = {};
            }
            newItemCatalog.hits = item.hits;

            listCatalog.push(newItemCatalog);
        }

        return listCatalog;
    };
};

module.exports = FunctionsFactory;