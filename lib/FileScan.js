"use strict";

var path = require("path");
var fs = require("fs");

var FileScan = function(functionsFactory, basePATH, config, configUnitTest){
    this.functionsFactory = functionsFactory;
    this.basePATH = basePATH || "functions";
    this.autoScan = true;
    this.monitorInterval = 1000;
    this.loadUnitTest = true;

    if ((config !== undefined) && (config !== null)){
        if ((config.automatic !== undefined) && (config.automatic !== undefined)){
            this.autoScan = config.automatic;
        }
        if ((config.interval !== undefined) && (config.interval !== undefined)){
            this.monitorInterval = config.interval;
        }
    }

    if ((configUnitTest !== undefined) && (configUnitTest !== null)){
        if ((configUnitTest.load !== undefined) && (configUnitTest.load !== undefined)){
            this.loadUnitTest = configUnitTest.load;
        }
    }
    
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

    function isValidFile(filePATH){
        var result;
        var pathParse = path.parse(filePATH);

        if (filePATH){
            result = pathParse.ext.toUpperCase() === ".JS";

            if (self.loadUnitTest === false){
                if (filePATH.substring(filePATH.length - 8).toUpperCase() === ".TEST.JS"){
                    result = false;
                }
            }

            if (pathParse.name.substring(0, 1) === "_"){
                result = false;
            }

            return result;
        }
        else{
            return false;
        }
    }

    this.getListFiles = function(path, callBack){
        var listFiles = [];
        
        function findFilesInDirectory(basePATH, callBackFind){
            var contTotal = 0;
            var contProcessed = 0;

            fs.readdir(basePATH, function(err, data){
               if (err){
                    console.error(err);
                    callBackFind(err);
                }
                else{
                    contTotal = data.length;
                    if (contTotal === 0){
                        //empty directory
                        callBackFind(null);
                        return;
                    }
                    else{
                        //console.log("in directory(" + contTotal + ") : " + basePATH);
                        for (var i = 0; i < contTotal; i++){
                            (function(filePATH){
                                fs.stat(filePATH, function(errStat, fileStat){
                                    if (errStat){
                                        contProcessed ++;
                                    }
                                    else{
                                        if (fileStat.isFile() === true){
                                            listFiles.push({file:filePATH, stat:fileStat});
                                            contProcessed ++;
                                        }
                                        else if (fileStat.isDirectory() === true){
                                            findFilesInDirectory(filePATH, function(){
                                                contProcessed ++;
                                                if (contProcessed === contTotal){
                                                    //console.log("out directory - processed " + contProcessed + " : " + basePATH);
                                                    callBackFind(null);
                                                }
                                            });
                                        }
                                        else{
                                            contProcessed ++;
                                        }
                                    }
                                    if (contProcessed === contTotal){
                                        //console.log("out directory - processed " + contProcessed + " : " + basePATH);
                                        callBackFind(null);
                                    }
                                });
                            })(basePATH + "/" + data[i]);
                        }
                    }
                }
            });
        }

        findFilesInDirectory(path, function(err){
            callBack(err, listFiles);
        });
    };

    this.addFunctionFromFile = function(filePATH, callBack){
        var opt = {};
        opt.name = getNameByPath(filePATH);
        opt.filePATH = filePATH;
        opt.dirPATH = path.dirname(filePATH);
        opt.basePATH = path.resolve(this.basePATH);

        self.functionsFactory.addFunctionManagerFromFile(filePATH, opt, callBack);
    };

    this.processDirectory = function(initPATH, callBack){
        this.getListFiles(path.resolve(initPATH), function(err, listFiles){
            var contTotal = listFiles.length;
            var contProcessed = 0;
            var contLoaded = 0;
            var listFilesProcessed = {};
            for (var i = 0; i < contTotal; i++){
                (function(filePATH, fileStat){
                    var itemLastListFiles = lastListFiles[filePATH];
                    if (itemLastListFiles && (itemLastListFiles.mtime === fileStat.mtime.getTime())){
                        contProcessed ++;

                        listFiles[filePATH] = {functionKey: itemLastListFiles.functionKey, mtime: itemLastListFiles.mtime};
                    }
                    else{
                        if (isValidFile(filePATH)){
                            self.addFunctionFromFile(filePATH, function(errFunctionFile, functionKey){
                                contProcessed ++;
                                
                                if (errFunctionFile === null){
                                    contLoaded ++;
                                    listFilesProcessed[filePATH] = {functionKey: functionKey, mtime: fileStat.mtime.getTime(), status:"new"};
                                }

                                if (contProcessed === contTotal){
                                    callBack(null, listFilesProcessed, contLoaded);
                                }
                            });
                        }
                        else{
                            contProcessed ++;
                        }
                    }

                    if (contProcessed === contTotal){
                        callBack(null, listFilesProcessed, contLoaded);
                    }
                })(listFiles[i].file, listFiles[i].stat);
            }
        })
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
        }, self.monitorInterval);
    };

    this.monitorStop = function(){
        if (monitorIdWaitScan){
            clearInterval(monitorIdWaitScan);
            monitorIdWaitScan = null;
        }
    };
};

module.exports = FileScan;