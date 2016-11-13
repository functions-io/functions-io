var http = require("http");
var FunctionsFactory = require("./FunctionsFactory");
var FileScan = require("./FileScan");
var serverProcessHTTP = require("./serverProcessHTTP");

var Server = function(config){
    this.factory = null;
    this.serverHTTP = null;
    this.serverHTTPListen = null;
    this.factory = new FunctionsFactory();
    this.defaultFileScan = null;
    
    var self = this;
    
    //Last function is serverProcessHTTP
    var httpFunctionsUSE = serverProcessHTTP;

    if ((config === undefined) || (config === null)){
        config = {};
    }
    
    if (config.isGenerateStatistics){
        this.factory.isGenerateStatistics = config.isGenerateStatistics;
    }
    this.defaultFileScan = new FileScan(this.factory, config.path, config.autoScan);
    
    this.start = function(callBack){
        if (this.defaultFileScan){
            this.defaultFileScan.scan(function(errScan, dataScan){
                if (errScan){
                    console.error(errScan);
                    if (callBack){
                        callBack(errScan);
                    }
                }
                else{
                    if (callBack){
                        callBack(null, dataScan);
                    }
                }
            });
        }
        else{
            if (callBack){
                callBack(null, dataScan);
            }
        }
    };

    this.stop = function(){
        if (this.serverHTTP){
            this.serverHTTP.close();
        }
        if (this.defaultFileScan){
            this.defaultFileScan.monitorStop();
        }
    };

    this.listen = function(){
        var argumentsListen = arguments;
        var callBackListen = arguments[arguments.length - 1];

        if (this.serverHTTP === null){
            this.serverHTTP = http.createServer();
        }
        
        this.serverHTTP.addListener("request", this.processRequestHTTP);

        this.start(function(errStart){
            self.serverHTTPListen = self.serverHTTP.listen.apply(self.serverHTTP, argumentsListen);
        });
    };

    this.processRequestHTTP = function(req, res){
        req.on("error", function(errReq) {
            console.error(errReq);

            res.statusCode = 400;
            res.end();
        });

        res.on("error", function(errRes) {
            console.error(errRes);
        });

        req.factory = self.factory;
        httpFunctionsUSE(req, res);
    };

    this.use = function(newFunction){
        if (httpFunctionsUSE === null){
            httpFunctionsUSE = newFunction;
        }
        else{
            (function(oldFunction){
                httpFunctionsUSE = function(req, res){
                    newFunction(req, res, function(){
                        oldFunction(req, res);
                    });
                };
            })(httpFunctionsUSE);
        }
    };
};

module.exports = Server;