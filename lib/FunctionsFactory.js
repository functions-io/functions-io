"use strict";

var vm = require("vm");
var fs = require("fs");
var InputValidate = require("./InputValidate");
var functionUnitTest = require("./functionsUnitTest");

var wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

var FunctionsFactory = function(){
    this.isGenerateStatistics = true;
    this.listFunctionManager = {};
    this.inputValidate = new InputValidate();
    this.enableCORS = false;
    this.enableCORSFromOrigin = "*";
    this.global = {};

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
                try{
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
                catch(errAddFunction){
                    var messageErr;

                    if (errAddFunction.stack){
                        messageErr = errAddFunction.stack.substring(0,errAddFunction.stack.indexOf("at"));
                    }
                    else{
                        messageErr = errAddFunction.message;
                    }
                    
                    console.error("Err load function: " + messageErr);
                    callBack(messageErr);
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

        //test
        if (functionManager.module.test){
            functionManager.stage = "_unitTest";
            functionManager.module.category = "unitTest";
            functionManager.summary = "Unit Test";
            functionManager.module.exports = functionUnitTest;
        }
        else{
            //exports
            if (!(functionManager.module.exports)){
                console.erro("Export required - " + functionManager.name);
                return null;
            }
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

        var newRequire = function(path){
            if (path.substring(0,1) === "/"){
                if (opt.basePATH){
                    path = opt.basePATH + "/" + path;
                }
            }
            else if (path.substring(0,2) === "./"){
                if (opt.dirPATH){
                    path = opt.dirPATH + "/" + path.substring(2);
                }
            }
            return require(path);
        }

        compiledWrapper(newModule.exports, newRequire, newModule, name, filePATH);

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
        this.invoke(messageRequest.stage, messageRequest.method, messageRequest.version, messageRequest.params, {global:this.global, header: messageRequest.header}, function(errInvoke, resultInvoke, functionManager){
            var messageResponse = {};
            
            messageResponse.id = messageRequest.id;
            
            if (errInvoke){
                messageResponse.error = errInvoke;
            }
            else{
                messageResponse.result = resultInvoke;
            }

            callBack(messageResponse, functionManager);
        });
    };

    this.invoke = function(functionStage, functionName, functionVersion, message, context, callBack){
        var functionManager;
        var callBackWrapper;
        var validateResult;
        
        if (!(functionName)){
            throw new RangeError("Parameter functionName required");
        }
        if (!(callBack instanceof Function)){
            throw new RangeError("Parameter callBack required");
        }
        if ((context === undefined) || (context === null)){
            context = {};
        }

        functionManager = this.getFunctionManager(functionStage, functionName, functionVersion);

        callBackWrapper = function(errWrapper, dataWrapper){
            callBack(errWrapper, dataWrapper, functionManager);
        }

        if (functionManager){
            //call function
            if (this.isGenerateStatistics === true){
                (function(){
                    try {
                        var diffTime = 0;
                        var start = process.hrtime();
                        
                        validateResult = self.inputValidate.parse(functionManager.name, message, functionManager.module.input); //validate and parse
                        if (validateResult.error){
                            functionManager.hits.error ++;
                            callBackWrapper(validateResult.error);
                            return;
                        }
                        else{
                            message = validateResult.data; //message parsed
                        }
                        
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
                        console.error(errorCall.message);
                        functionManager.hits.abort ++;
                        callBackWrapper(errorCall);
                    }
                })();
            }
            else{
                try {
                    validateResult = self.inputValidate.parse(functionManager.name, message, functionManager.module.input); //validate and parse
                    if (validateResult.error){
                        functionManager.hits.error ++;
                        callBackWrapper(validateResult.error);
                        return;
                    }
                    else{
                        message = validateResult.data; //message parsed
                    }
                    functionManager.module.exports(context, message, callBackWrapper);
                } catch (errorCall) {
                    console.error(errorCall.message);
                    callBackWrapper(errorCall);
                }
            }
        }
        else{
            throw new ReferenceError("Function not found");
        }
    };
};

module.exports = FunctionsFactory;