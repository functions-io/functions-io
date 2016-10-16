"use strict";

var path = require("path");

var FunctionManagerFactory = function(){
    this.getNameByPath = function(filePATH){
        var tempName;
        tempName = filePATH.substring(path.resolve(this.basePATH).length + 1);
        tempName = tempName.substring(0,tempName.lastIndexOf("."));
        tempName = tempName.replace(/\//g,".");
        return tempName;     
    };

    this.createInstance = function(filePATH, fileStat, functionInstance){
        var functionManager;
        
        functionManager = {};
        functionManager.module = functionInstance;
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
};

module.exports = new FunctionManagerFactory();