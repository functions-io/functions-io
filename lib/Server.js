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
    
    //First function call in app.use()
    var httpFunctionFirstUSE = null;

    if ((config === undefined) || (config === null)){
        config = {};
    }
    
    if (config.isGenerateStatistics){
        this.factory.isGenerateStatistics = config.isGenerateStatistics;
    }

    if (config.enableCORS){
        this.factory.enableCORS = config.enableCORS;
    }

    if (config.enableCORSFromOrigin){
        this.factory.enableCORSFromOrigin = config.enableCORSFromOrigin;
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

        req.factory = self.factory;
        httpFunctionFirstUSE(req, res);
    };

    this.use = function(par1, par2){
        var newFunction = null;
        var path = null;
        
        if (typeof par1 === "function") {
            newFunction = par1;
        }
        else{
            if (typeof par1 === "string"){
                path = par1;
            }
            else{
                throw new TypeError('Parameter path not string');
            }

            if (typeof par2 === "function"){
                newFunction = par2;
            }
            else{
                throw new TypeError("middleware functions required");
            }
        }

        if (path){
            //Wrapper new function
            newFunction = (function(fn, fnPath){
                var wrapperFunction = function(req, res, next){
                    if (req.url.indexOf(fnPath) === 0){
                        fn(req, res, next, fnPath);
                    }
                    else{
                        if (next){
                            next();
                        }
                        else{
                            console.error("Context not found for process request '" + req.url + "'");
                            res.writeHead(404);
                            res.end();
                        }
                    }
                };

                return wrapperFunction;
            })(newFunction, path);
        }

        if (httpFunctionFirstUSE === null){
            httpFunctionFirstUSE = newFunction;
        }
        else{
            (function(oldFunction){
                httpFunctionFirstUSE = function(req, res){
                    newFunction(req, res, function(){
                        oldFunction(req, res);
                    });
                };
            })(httpFunctionFirstUSE);
        }
    };

    //serverProcessHTTP is last function call
    if (config.mountpath){
        self.use(config.mountpath, serverProcessHTTP);
    }
    else{
        self.use(serverProcessHTTP);
    }

    //Load System Functions
    this.factory.addFunctionManagerFromFile("sys/stats.js");
    this.factory.addFunctionManagerFromFile("sys/openapi.js");
};

module.exports = Server;