"use strict";

var fs = require("fs");
var functionCompile = require("./functionCompile");
var functionManagerFactory = require("./functionManagerFactory");
var fileScan = require("./fileScan");

var FunctionsFactory = function(){
    this.basePATH = "functions";
    this.listFunctionManager = {};
    this.index_listFunctionManagerByFile = {};
    this.isPublicCatalog = true;
    this.isGenerateStatistics = true;

    var self = this;

    this.scan = function(callBack){
        var cont = 0;
        var contLoad = 0;
        var contError = 0;

        fileScan.getFiles(this.basePATH, function(err, listFiles){
            if (err){
                callBack(err);
            }
            else{
                var total = listFiles.length;

                for (var i =0; i < listFiles.length; i++){
                    var item = listFiles[i];
                    
                    self.loadFunctionAsync(item.file, item.stat, function(errLoad, dataLoad){
                        cont ++;
                        if (errLoad){
                            contError ++;
                        }
                        else{
                            if (dataLoad === 1){
                                contLoad ++;
                            }
                        }

                        if (cont === total){
                            callBack(null, contLoad);
                        }
                    });
                }
            }
        });
    };

    this.loadFunctionAsync = function(filePATH, fileStat, callBack){
        var key;
        
        key = this.index_listFunctionManagerByFile[filePATH];
        if (key){
            var functionManager;
            functionManager = this.listFunctionManager[key];
            
            if (functionManager !== undefined){
                if ((functionManager.ctime.getTime() === fileStat.ctime.getTime()) && (functionManager.mtime.getTime() === fileStat.mtime.getTime())){
                    callBack(null, 0);
                    return;
                }
            }
        }
        
        fs.readFile(filePATH, function(err, code){
            if (err){
                callBack(err);
            }
            else{
                try {
                    self.createFunctionManager(filePATH, fileStat, code);

                    callBack(null, 1);
                } catch(err) {
                    console.error(err);
                    callBack(err);
                }
            }
        });
    };

    this.createFunctionManager = function(filePATH, fileStat, code){
        var newFunctionManager;
        var key;
        
        newFunctionManager = functionManagerFactory.createInstance(filePATH, fileStat, functionCompile.compile(filePATH, code));
        
        key = newFunctionManager.name + "-" + newFunctionManager.version;
        this.listFunctionManager[key] = newFunctionManager;
        this.index_listFunctionManagerByFile[filePATH] = key;
        
        console.info("Function " + newFunctionManager.name + "-" + newFunctionManager.version + " loaded");

        return newFunctionManager;
    };

    this.getFunctionManager = function(functionName, functionVersion){
        if (!(functionName)){
            throw new RangeError("Parameter required");
        }

        return this.listFunctionManager[functionName + "-" + functionVersion];
    };
    
    this.invoke = function(functionName, functionVersion, message, context, callBack){
        var functionManager;
        
        if (!(functionName)){
            throw new RangeError("Parameter required");
        }
        if (!(callBack instanceof Function)){
            throw new RangeError("Parameter callBack required");
        }

        //return catalog
        if ((functionName === "sys.catalog") && (this.isPublicCatalog === true)){
            callBack(null, this.getCatalog());
            return; 
        }
        
        functionManager = this.getFunctionManager(functionName, functionVersion);

        if (functionManager){
            if (functionManager.module.exports){
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
                throw new ReferenceError("Method not found");
            }
        }
        else{
            throw new ReferenceError("Function not found");
        }
    };

    this.invokeMessage = function(messageRequest, callBack){
        this.invoke(messageRequest.method, messageRequest.version, messageRequest.params, messageRequest.header, function(errInvoke, resultInvoke){
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
    
    this.getCatalog = function(){
        var listCatalog = [];
        var item;
        var keys;
        var newItemCatalog;

        keys = Object.keys(this.listFunctionManager);
        for (var i = 0; i < keys.length; i++){
            item = this.listFunctionManager[keys[i]];
            newItemCatalog = {};
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