"use strict";

var path = require("path");
var fs = require("fs");

var FileScan = function(functionsFactory, basePATH, autoScan){
    this.functionsFactory = functionsFactory;
    this.basePATH = basePATH || "functions";
    if ((autoScan === undefined) || (autoScan === null)){
        this.autoScan = true;
    }
    else{
        this.autoScan = autoScan;
    }
    this.monitorInterval = 5000;
    
    var self = this;
    var lastListFiles = {};
    var monitorIdWaitScan = null;

    function getNameByPath(filePATH){
        var tempName;
        tempName = filePATH.substring(path.resolve(self.basePATH).length + 1);
        tempName = tempName.substring(0,tempName.lastIndexOf("."));
        tempName = tempName.replace(/\//g,".");
        return tempName;
    };

    function isFileExtensionJS(filePATH){
        if (filePATH){
            return (filePATH.substring(filePATH.lastIndexOf(".")).toUpperCase() === ".JS");
        }
        else{
            return false;
        }
    }

    this.addFunctionFromFile = function(filePATH, callBack){
        fs.readFile(filePATH, function(err, code){
            if (err){
                callBack(err);
            }
            else{
                var opt = {};
                opt.name = getNameByPath(filePATH);
                var functionManager = self.functionsFactory.addFunctionManagerFromCode(code, opt);
                if (functionManager){
                    callBack(null, functionManager.key);
                }
                else{
                    callBack();
                }
            }
        });
    };

    this.processDirectory = function(initPATH, callBack){
        var listFiles = {};
        var contLoaded = 0;
        
        function processAllFiles(basePATH, level, callBackProcessAllFiles){
            var contTotal = 0;
            var contProcessed = 0;

            fs.readdir(basePATH, function(err, data){
                if (err){
                    console.error(err);
                    callBackProcessAllFiles(err);
                }
                else{
                    contTotal = data.length;
                    for (var i = 0; i < contTotal; i++){
                        (function(filePATH){
                            fs.stat(filePATH, function(errStat, fileStat){
                                if (fileStat.isFile() === true){
                                    var itemLastListFiles = lastListFiles[filePATH];
                                    if (itemLastListFiles && (itemLastListFiles.mtime === fileStat.mtime.getTime())){
                                        contProcessed ++;

                                        listFiles[filePATH] = {functionKey: itemLastListFiles.functionKey, mtime: itemLastListFiles.mtime};

                                        if (contProcessed === contTotal){
                                            callBackProcessAllFiles(null);
                                        }
                                    }
                                    else{
                                        if (isFileExtensionJS(filePATH)){
                                            self.addFunctionFromFile(filePATH, function(errFunctionFile, functionKey){
                                                contProcessed ++;
                                                contLoaded ++;

                                                if (errFunctionFile === null){
                                                    listFiles[filePATH] = {functionKey: functionKey, mtime: fileStat.mtime.getTime()} 
                                                }
                                                
                                                if (contProcessed === contTotal){
                                                    callBackProcessAllFiles(null);
                                                }
                                            });
                                        }
                                    }
                                }
                                else if (fileStat.isDirectory() === true){
                                    processAllFiles(filePATH, level + 1, function(){
                                        contProcessed ++;

                                        if (contProcessed === contTotal){
                                            callBackProcessAllFiles(null);
                                        }
                                    });
                                }
                                else{
                                    contProcessed ++;
                                }
                            });
                        })(basePATH + "/" + data[i]);
                    }

                    if (contProcessed === contTotal){
                        callBackProcessAllFiles(null);
                    }
                }
            });
        }

        processAllFiles(path.resolve(initPATH), 0, function(processAllFiles){
            if (processAllFiles){
                callBack(processAllFiles);
            }
            else{
                callBack(null, listFiles, contLoaded);
            }
        });
    };

    this.scan = function(callBack){
        this.processDirectory(this.basePATH, function(err, listFiles, contLoaded){
            if (err){
                callBack(err);
            }
            else{
                lastListFiles = listFiles;
                if (self.autoScan){
                    self.monitorStart();
                }
                callBack(null, contLoaded);
            }
        });
    };

    this.monitorStart = function(){
        monitorIdWaitScan = setInterval(function(){
            self.monitorStop();

            self.scan(function(err, data){
                if (err){
                    console.error(err);
                }
                else{
                    if (data){
                        console.log(new Date() + " - " + data + " functions loaded");
                    }
                }
            });
        }, this.interval);
    };

    this.monitorStop = function(){
        if (monitorIdWaitScan){
            clearInterval(monitorIdWaitScan);
            monitorIdWaitScan = null;
        }
    };
};

module.exports = FileScan;