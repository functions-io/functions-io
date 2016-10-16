"use strict";

var fs = require("fs");
var FunctionManagerFactory = require("./FunctionManagerFactory");
var fileScan = require("./fileScan");

var FunctionsFactory = function(){
    this.basePATH = "functions";
    this.isPublicCatalog = true;
    this.isGenerateStatistics = true;
    this.functionManagerFactory = new FunctionManagerFactory();
    this.lastTimeScan = null;

    var self = this;

    this.scan = function(callBack){
        var cont = 0;
        var contLoad = 0;
        var contError = 0;

        this.lastTimeScan = new Date().getTime();

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
        var functionManager;
        
        functionManager = this.functionManagerFactory.getFunctionManagerByPath(filePATH);
        if (functionManager){
            if ((functionManager.ctime.getTime() === fileStat.ctime.getTime()) && (functionManager.mtime.getTime() === fileStat.mtime.getTime())){
                callBack(null, 0);
                return;
            }
        }
        
        fs.readFile(filePATH, function(err, code){
            var functionManager; //local in function readFile
            if (err){
                callBack(err);
            }
            else{
                try {
                    functionManager = self.functionManagerFactory.createInstance(filePATH, fileStat, code);
                    if (functionManager){
                        self.functionManagerFactory.addFunctionManager(functionManager);
                        callBack(null, 1);
                    }
                    else{
                        callBack(null, 0);
                    }
                } catch(err) {
                    console.error(err);
                    callBack(err);
                }
            }
        });
    };

    this.invokeMessage = function(messageRequest, callBack){
        this.functionManagerFactory.invoke(messageRequest.method, messageRequest.version, messageRequest.params, messageRequest.header, function(errInvoke, resultInvoke){
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

    this.getCount = function(){
        return Object.keys(this.functionManagerFactory.listFunctionManager).length;
    };
    
    this.getCatalog = function(){
        var listCatalog = [];
        var item;
        var keys;
        var newItemCatalog;

        keys = Object.keys(this.functionManagerFactory.listFunctionManager);
        for (var i = 0; i < keys.length; i++){
            item = this.functionManagerFactory.listFunctionManager[keys[i]];
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