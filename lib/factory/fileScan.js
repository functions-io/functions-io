"use strict";

var path = require("path");
var fs = require("fs");

var FileScan = function(){
    this.getFiles = function(initPATH, callBack){
        var listFiles = [];
        
        function getAllFiles(basePATH, level){
            var data = fs.readdirSync(basePATH);

            for (var i =0; i < data.length; i++){
                var fileExtension;
                var fileStat;
                var filePATH;

                filePATH = basePATH + "/" + data[i];
                fileStat = fs.statSync(filePATH);
                if (fileStat.isFile() === true){
                    fileExtension = filePATH.substring(filePATH.lastIndexOf(".")).toUpperCase();
                    if (fileExtension === ".JS"){
                        listFiles.push({file:filePATH, stat: fileStat});
                    }
                }
                else if (fileStat.isDirectory() === true){
                    getAllFiles(filePATH, level + 1);
                }
            }

            if (level === 0){
                callBack(null, listFiles);
            }
        }

        getAllFiles(path.resolve(initPATH), 0);
    };
};

module.exports = new FileScan();