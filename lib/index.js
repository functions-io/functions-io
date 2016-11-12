var Server = require("./Server");
var FunctionsFactory = require("./FunctionsFactory");
var FileScan = require("./FileScan");
var serverProcessHTTP = require("./serverProcessHTTP");

module.exports.createServer = function(config){
    return new Server(config);
};

module.exports.createFunctionsFactory = function(){
    return new FunctionsFactory();
};

module.exports.createFileScan = function(functionsFactory, basePATH, autoScan){
    return new FileScan(functionsFactory, basePATH, autoScan);
};

module.exports.serverProcessHTTP = serverProcessHTTP;