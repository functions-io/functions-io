"use strict";

var vm = require("vm");
var path = require("path");
var fs = require("fs");

var wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

var FunctionsFactory = function(){
    this.basePATH = "functions";
    this.listFunctionManager = {};
    this.isPublicCatalog = true;
    this.isGenerateStatistics = true;

    var self = this;
    var idWaitScan = null;

    this.startAutoScan = function(interval){
        console.log("Wait factory start");

        if (interval === undefined){
            interval = 1000;
        }
        
        idWaitScan = setInterval(function(){
            self.scanAsync(function(err, data){
                if (err === null){
                    if (err){
                        console.log(err);
                    }
                    else{
                        if (data > 0){
                            console.log(new Date() + " - " + data + " functions loaded");
                        }
                    }
                }
                else{
                    console.log(err);
                }
            });
        }, interval);
    };

    this.stopAutoScan = function(){
        if (idWaitScan){
            clearInterval(idWaitScan);
            idWaitScan = null;
        }
    };

    this.scanAsync = function(callBack){
        var cont = 0;
        function getAllFiles(basePATH, callBackAllFiles){
            fs.readdir(basePATH, function(err, data){
                var tempListControlProcessFile = {};
                if (err){
                    console.error(err);
                    callBackAllFiles(err);
                    return;
                }
                else{
                    for (var i =0; i < data.length; i++){
                        (function(filePATH){
                            tempListControlProcessFile[filePATH] = 0;
                            fs.stat(filePATH, function(errStat, fileStat){
                                var fileExtension;
                    
                                if (errStat){
                                    delete tempListControlProcessFile[filePATH];
                                }
                                else{
                                    if (fileStat.isFile() === true){
                                        fileExtension = filePATH.substring(filePATH.lastIndexOf(".")).toUpperCase();
                                        if (fileExtension === ".JS"){
                                            self.loadFunctionAsync(filePATH, fileStat, function(errLoad, dataLoad){
                                                delete tempListControlProcessFile[filePATH];
                                                if (errLoad === null){
                                                    if (dataLoad === 1){
                                                        cont ++;
                                                    }
                                                }
                                                if (Object.keys(tempListControlProcessFile).length === 0){
                                                    callBackAllFiles(null);
                                                }
                                            });
                                        }
                                        else{
                                            delete tempListControlProcessFile[filePATH];
                                            if (Object.keys(tempListControlProcessFile).length === 0){
                                                callBackAllFiles(null);
                                            }
                                        }
                                    }
                                    else if (fileStat.isDirectory() === true){
                                        getAllFiles(filePATH, function(){
                                            callBackAllFiles(null);
                                        });
                                    }
                                    else{
                                        delete tempListControlProcessFile[filePATH];
                                        if (Object.keys(tempListControlProcessFile).length === 0){
                                            callBackAllFiles(null);
                                        }
                                    }
                                }
                            });
                        })(basePATH + "/" + data[i]);
                    }

                    if (Object.keys(tempListControlProcessFile).length === 0){
                        callBackAllFiles(null);
                    }
                }
            });
        }

        getAllFiles(path.resolve(this.basePATH), function(err){
            callBack(err, cont);
        });
    };

    this.loadFunctionAsync = function(filePATH, fileStat, callBack){
        var functionManager;
        
        functionManager = this.listFunctionManager[filePATH];
        
        if (functionManager !== undefined){
            if ((functionManager.ctime.getTime() === fileStat.ctime.getTime()) && (functionManager.mtime.getTime() === fileStat.mtime.getTime())){
                callBack(null, 0);
            }
        }
        else{
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
        }
    };

    this.createFunctionManager = function(filePATH, fileStat, code){
        var functionManager;
        var tempName;
        var tempIndex;

        functionManager = {};
        functionManager.module = this.compile(filePATH, code);
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

        tempName = filePATH.substring(path.resolve(this.basePATH).length + 1);
        tempName = tempName.substring(0,tempName.lastIndexOf("."));
        tempName = tempName.replace(/\//g,".");
        tempIndex = tempName.lastIndexOf("-");
        
        functionManager.name = tempName.substring(0,tempIndex);
        functionManager.version = tempName.substring(tempIndex + 1);

        this.listFunctionManager[filePATH] = functionManager;
        
        console.info("Function " + filePATH + " created");
    };

    this.compile = function(filePATH, code){
        var codeWrapper = wrapper[0] + code + wrapper[1];
        var compiledWrapper = vm.runInThisContext(codeWrapper, {
            filename: filePATH,
            lineOffset: 1,
            displayErrors: true
        });

        var newModule = {};
        newModule.exports = {};

        compiledWrapper(newModule.exports, require, newModule, filePATH, filePATH);

        return newModule;
    };

    this.getFunctionManager = function(functionName, functionVersion){
        var filePATH;
        var functionPATH;
        
        if (!(functionName)){
            throw new RangeError("Parameter required");
        }

        functionPATH = functionName.replace(/\./g,"/");
        if (functionVersion){
            functionPATH += "-" + functionVersion;
        }
        
        filePATH = path.resolve(this.basePATH + "/" + functionPATH + ".js");

        return this.listFunctionManager[filePATH];
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