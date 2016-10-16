"use strict";

var path = require("path");
var functionCompile = require("./functionCompile");

var FunctionManagerFactory = function(){
    this.isGenerateStatistics = true;
    this.listFunctionManager = {};
    this.index_listFunctionManagerByFile = {};

    this.getNameByPath = function(filePATH){
        var tempName;
        tempName = filePATH.substring(path.resolve(this.basePATH).length + 1);
        tempName = tempName.substring(0,tempName.lastIndexOf("."));
        tempName = tempName.replace(/\//g,".");
        return tempName;
    };

    this.getKeyByFilePath = function(filePATH){
        return this.index_listFunctionManagerByFile[filePATH];
    };

    this.getFunctionManager = function(functionName, functionVersion){
        var functionManager;

        if (!(functionName)){
            throw new RangeError("Parameter required");
        }

        functionManager = this.listFunctionManager[functionName + "-" + (functionVersion || "")];
        if (functionManager === undefined){
            return null;
        } 
        else{
            return functionManager;
        }
    };

    this.getFunctionManagerByPath = function(filePATH){
        var key;
        var functionManager;

        if (!(path)){
            throw new RangeError("Parameter required");
        }

        key = this.getKeyByFilePath(filePATH);
        if (key){
            functionManager = this.listFunctionManager[key];
            if (functionManager === undefined){
                return null;
            }
            else{
                return functionManager;
            }
        }
        else{
            return null;
        }
    };

    this.addFunctionManager = function(newFunctionManager){
        var key;
        
        key = newFunctionManager.name + "-" + newFunctionManager.version;
        this.listFunctionManager[key] = newFunctionManager;
        this.index_listFunctionManagerByFile[newFunctionManager.path] = key;
        
        console.info("Function " + newFunctionManager.name + "-" + newFunctionManager.version + " loaded");

        return newFunctionManager;
    };

    this.createInstance = function(filePATH, fileStat, code){
        var functionManager;
        
        functionManager = {};
        
        functionManager.module = functionCompile.compile(filePATH, code);
        functionManager.hits = {};
        functionManager.hits.success = 0;
        functionManager.hits.error = 0;
        functionManager.hits.abort = 0;
        functionManager.hits.lastResponseTime = 0;
        functionManager.hits.avgResponseTime = 0;
        functionManager.hits.maxResponseTime = 0;
        functionManager.hits.minResponseTime = 0;
        functionManager.ctime = fileStat.ctime;
        functionManager.mtime = fileStat.mtime;
        functionManager.path = filePATH;

        if (functionManager.module.info){
            if (functionManager.module.info.name){
                functionManager.name = functionManager.module.info.name;
            }
            else{
                functionManager.name = this.getNameByPath(filePATH);
            }
            if (functionManager.module.info.version){
                functionManager.version = functionManager.module.info.version;
            }
            else{
                functionManager.version = "";
            }
        }
        else{
            functionManager.name = this.getNameByPath(filePATH);
            functionManager.version = "";
        }
        
        return functionManager;
    };

    this.invoke = function(functionName, functionVersion, message, context, callBack){
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

    this.getCount = function(){
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

module.exports = FunctionManagerFactory;