var http = require("http");
var FunctionsFactory = require("./FunctionsFactory");
var FileScan = require("./FileScan");
var serverProcessHTTP = require("./serverProcessHTTP");

var Server = function(config){
    this.factory = null;
    this.serverHTTP = null;
    this.factory = new FunctionsFactory();
    this.defaultFileScan = null;
    
    //Last function is serverProcessHTTP
    var httpFunctionsUSE = serverProcessHTTP;

    if ((config === undefined) || (config === null)){
        config = {};
    }
    
    if (config.isGenerateStatistics){
        this.factory.isGenerateStatistics = config.isGenerateStatistics;
    }
    this.defaultFileScan = new FileScan(this, config.path, config.autoScan);
    
    this.start = function(port, callBack){
        if (this.defaultFileScan){
            this.defaultFileScan.scan(function(errScan, dataScan){
                if (errScan){
                    console.error(errScan);
                    if (callBack){
                        callBack(errScan);
                    }
                }
                else{
                    self.listen(port, function(){
                        console.log("Server online in port " + self.serverHTTP.address().port);
                        if (callBack){
                            callBack(null, dataScan);
                        }
                    });
                }
            });
        }
        else{
            this.listen(port, function(){
                console.log("Server online in port " + self.serverHTTP.address().port);
                if (callBack){
                    callBack(null);
                }
            });
        }
    };

    this.listen = function(){
        if (this.serverHTTP === null){
            this.serverHTTP = http.createServer();
        }
        
        http.addListener("request", this.processRequestHTTP);

        this.serverHTTP.listen.apply(this.serverHTTP, arguments);

        return this.server;
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

        req.factory = this.factory;
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