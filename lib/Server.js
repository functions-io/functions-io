var http = require("http");
var FunctionsFactory = require("./factory/FunctionsFactory");
var ServerProcessHTTP = require("./ServerProcessHTTP");

var Server = function(config){
    this.factory = null;
    this.serverHTTP = null;
    this.factory = new FunctionsFactory();
    this.serverProcessHTTP = new ServerProcessHTTP(this.factory);
    
    var self = this;
    var httpFunctionsUSE = this.serverProcessHTTP.process;

    if ((config === undefined) || (config === null)){
        config = {};
    }
    if (config.isGenerateStatistics){
        this.factory.functionManagerFactory.isGenerateStatistics = config.isGenerateStatistics;
    }
    if (config.path){
        this.factory.basePATH = config.path;
    }
    if (config.autoScan){
        this.factory.autoScan = config.autoScan;
    }
    if (config.autoScanInterval){
        this.factory.autoScanInterval = config.autoScanInterval;
    }

    this.start = function(port){
        this.factory.scan(function(err){
            if (err){
                console.error(err);
            }
            else{
                self.listen(port);
                console.log("Server online in port " + self.serverHTTP.address().port);
            }
        });
    };

    this.listen = function(){
        if (this.serverHTTP === null){
            this.serverHTTP = http.createServer();
        }
        
        this.addListenerHTTP(this.serverHTTP);

        this.serverHTTP.listen.apply(this.serverHTTP, arguments);

        return this.server;
    };

    this.addListenerHTTP = function(http){
        http.addListener("request", this.processRequestHTTP);
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