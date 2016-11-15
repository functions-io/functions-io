"use strict";

var vm = require("vm");
var fs = require("fs");

var wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

var FunctionsFactory = function(){
    this.isGenerateStatistics = true;
    this.listFunctionManager = {};
    this.enableCORS = false;

    var self = this;

    this.addFunctionManagerFromFile = function(filePATH, opt, callBack){
        if ((opt === undefined) || (opt === null)){
            opt = {};
            opt.filePATH = filePATH;
        }
        fs.readFile(filePATH, function(err, code){
            if (err){
                console.error(err);
                if (callBack){
                    callBack(err);
                }
            }
            else{
                var functionManager = self.addFunctionManagerFromCode(code, opt);
                if (callBack){
                    if (functionManager){
                        callBack(null, functionManager.key);
                    }
                    else{
                        callBack("Not Found");
                    }
                }
            }
        });
    };

    this.addFunctionManagerFromCode = function(code, opt){
        return this.addFunctionManager(this.buildFunctionManagerFromCode(code, opt));
    };

    this.addFunctionManager = function(functionManager){
        if (functionManager){
            //warning modify - getFunctionManager
            functionManager.key = functionManager.stage + "-" + functionManager.name + "-" + functionManager.version;
            
            this.listFunctionManager[functionManager.key] = functionManager;

            console.info("Function " + functionManager.key + " loaded");

            return functionManager;
        }
        else{
            return null;
        }
    };

    this.buildFunctionManagerFromCode = function(code, opt){
        return this.buildFunctionManager(this.compile(code, opt), opt);
    };

    this.buildFunctionManager = function(moduleInstance, opt){
        var functionManager;
        
        functionManager = {};
        
        functionManager.module = moduleInstance;

        //exports
        if (!(functionManager.module.exports)){
            return null;
        }

        if (functionManager.module.returnType){
            functionManager.returnType = functionManager.module.returnType;
        }
        else{
            functionManager.returnType = null; 
        }

        //stage
        if ((opt) && (opt.stage)){
            functionManager.stage = opt.stage;
        }
        else{
            if (functionManager.module.stage){
                functionManager.stage = functionManager.module.stage;
            }
            else{
                functionManager.stage = "";
            }
        }
        
        //name
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

        //version
        if (functionManager.module.version){
            functionManager.version = functionManager.module.version;
        }
        else{
            functionManager.version = "";
        }

        functionManager.module._factory = self;
        
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

    this.compile = function(code, opt){
        var codeWrapper = wrapper[0] + code + wrapper[1];
        var name = "functions";
        var filePATH = "functions";

        if (opt){
            if (opt.name){
                name = opt.name;
            }
            if (opt.filePATH){
                filePATH = opt.filePATH;
            }
        }

        var compiledWrapper = vm.runInThisContext(codeWrapper, {
            filename: filePATH,
            lineOffset: 0,
            displayErrors: true
        });

        var newModule = {};
        newModule.exports = {};

        compiledWrapper(newModule.exports, require, newModule, name, "functions");

        return newModule;
    };

    this.getFunctionManager = function(functionStage, functionName, functionVersion){
        var functionManager;
        
        if ((functionStage === undefined) || (functionStage === null)){
            functionStage = "";
        }
        if (!(functionName)){
            throw new RangeError("Parameter required");
        }
        if ((functionVersion === undefined) || (functionVersion === null)){
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
        this.invoke(messageRequest.stage, messageRequest.method, messageRequest.version, messageRequest.params, messageRequest.header, function(errInvoke, resultInvoke, resultReturnType){
            var messageResponse = {};
            
            messageResponse.id = messageRequest.id;
            if (resultReturnType){
                messageResponse.returnType = resultReturnType;
            }
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
        var callBackWrapper;
        
        if (!(functionName)){
            throw new RangeError("Parameter functionName required");
        }
        if (!(callBack instanceof Function)){
            throw new RangeError("Parameter callBack required");
        }

        functionManager = this.getFunctionManager(functionStage, functionName, functionVersion);

        callBackWrapper = function(errWrapper, dataWrapper){
            callBack(errWrapper, dataWrapper, functionManager.returnType);
        }

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
                            
                            callBackWrapper(errFunc, dataFunc);
                        });
                    } catch (errorCall) {
                        console.error(errorCall);
                        functionManager.hits.abort ++;
                    }
                })();
            }
            else{
                functionManager.module.exports(context, message, callBackWrapper);
            }
        }
        else{
            throw new ReferenceError("Function not found");
        }
    };
};

module.exports = FunctionsFactory;