var http = require("http");
var FunctionsFactory = require("./factory/FunctionsFactory");
var httpInvokeFunctionsServer = require("./endpoint/httpInvokeFunctionsServer");

module.exports.getFactoryInstance = function(){
    return new FunctionsFactory();
};

module.exports.httpInvokeFunctionsServer = function(factory, req, res){
    return httpInvokeFunctionsServer(factory, req, res);
};

module.exports.listen = function(config, callBack){
    var response = {};
    response.factory = null;
    response.serverHTTP = null;
 
    response.factory = new FunctionsFactory();

    if ((config === undefined) || (config === null)){
        config = {};
    }
    if (config.isPublicCatalog){
        response.factory.isPublicCatalog = config.isPublicCatalog;
    }
    if (config.isGenerateStatistics){
        response.factory.isGenerateStatistics = config.isGenerateStatistics;
    }
    if (config.path){
        response.factory.basePATH = config.path;
    }
    if (!(config.port)){
        config.port = 8080;
    }

    response.factory.scanAsync(function(errScan, dataScan){
        if (errScan){
            console.error(errScan);
            if (callBack){
                callBack(errScan, null);
            }
        }
        else{
            console.log(new Date() + " - " + dataScan + " functions loaded");

            response.serverHTTP = http.createServer(function(req, res){
                httpInvokeFunctionsServer(response.factory, req, res);
            });

            response.serverHTTP.listen(config.port, function(errHTTP){
                if (errHTTP){
                    if (callBack){
                        callBack(errHTTP);
                    }
                }
                else{
                    console.log("HTTP Listen in port " + config.port);
                    if (callBack){
                        callBack(null, response);
                    }
                }
            });
        }
    });
};