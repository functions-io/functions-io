"use strict";

var path = require("path");
var fs = require("fs");
var chokidar = require("chokidar");

var FileScan = function(functionsFactory, basePATH, autoScan){
    this.functionsFactory = functionsFactory;
    this.basePATH = basePATH || "functions";
    if ((autoScan !== undefined) || (autoScan !== null)){
        this.autoScan = autoScan;
    }
    else{
        this.autoScan = true;
    }
    
    var self = this;

    function isFileExtensionJS(filePATH){
        var fileExtension = filePATH.substring(filePATH.lastIndexOf(".")).toUpperCase();
        return (fileExtension === ".JS");
    }

    function getFunctionNameByFilePath(filePATH){
        var tempName;
        tempName = filePATH.substring(path.resolve(filePATH).length + 1);
        tempName = tempName.substring(0,tempName.lastIndexOf("."));
        tempName = tempName.replace(/\//g,".");
        return tempName;
    };
    
    this.addFunctionFromFile = function(filePATH, callBack){
        fs.readFile(filePATH, function(err, code){
            if (err){
                callBack(err);
            }
            else{
                var opt = {};
                opt.name = getFunctionNameByFilePath(filePATH);
                self.functionsFactory.addFunctionManagerFromCode(code, opt);
                callBack(null);
            }
        });
    };

    this.processDirectory = function(initPATH, callBack){
        var listFiles = [];
        var contTotal = 0;
        var contProcessed = 0;
        
        function processAllFiles(basePATH, level){
            fs.readdir(basePATH, function(err, data){
                for (var i =0; i < data.length; i++){
                    var fileExtension;
                    var fileStat;
                    var filePATH;

                    filePATH = basePATH + "/" + data[i];
                    fileStat = fs.statSync(filePATH);
                    if (fileStat.isFile() === true){
                        if (isFileExtensionJS(filePATH)){
                            contTotal ++;
                            self.addFunctionFromFile(filePATH, function(err){
                                if (err === null){
                                    listFiles.push({file:filePATH, statText: fileStat.ctime.getTime() + "-" + fileStat.mtime.getTime()});
                                }
                                contProcessed ++;
                                if (contProcessed === contTotal){
                                    callBack(null, listFiles);
                                }
                            });
                        }
                    }
                    else if (fileStat.isDirectory() === true){
                        processAllFiles(filePATH, level + 1);
                    }
                }
            });
        }

        processAllFiles(path.resolve(initPATH), 0);
    };

    this.scan = function(callBack){
        this.processDirectory(this.basePATH, function(err, listFiles){
            if (self.autoScan){
                self.monitorStart();
            }
            callBack(null, listFiles.length);
        });
    };

    this.monitorStart = function(){
        console.log("Monitoring folder " + this.basePATH);
        var watcher = chokidar.watch(this.basePATH, {ignoreInitial:true, ignored: /[\/\\]\./});
        watcher.on("all", function(event, filePATH){
            if (event === "add" || event === "change"){
                if (isFileExtensionJS(filePATH)){
                    self.addFunctionFromFile(filePATH, function(err){
                        if (err){
                            console.error(err);
                        }
                    });
                }
            }
        });
    };
};

module.exports = FileScan;