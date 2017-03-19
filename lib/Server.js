var functions_io_core = require("functions-io-core");
var http = require("http");
var serverProcessHTTP = require("./serverProcessHTTP");
var ecstatic = require('ecstatic');

var Server = function(config){
    this.config = config;
    this.serverHTTP = null;
    this.serverHTTPListen = null;
    this.isDisableGenerateHTML = false;
    this.server = functions_io_core.createServer(config);

    var self = this;
    
    //First function call in app.use()
    var httpFunctionFirstUSE = null;

    this._init = function(){
        if ((this.config === undefined) || (this.config === null)){
            this.config = {};
        }
        if (!(this.config.baseURL)){
            this.config.baseURL = "/api";
        }
    
        self.use("/_admin", ecstatic({root: __dirname + "/html", baseDir: "/_admin"}));

        if ((this.config.static) && (this.config.static.root)){
            self.use(this.config.static.baseDir || "/", ecstatic(this.config.static));
        }

        //serverProcessHTTP is last function call
        self.use(this.config.baseURL, serverProcessHTTP);
    };

    this.start = function(callBack){
        this.server.loadSysFunctions(__dirname.substring(0, __dirname.length - 3), function(errLoadSysFunctions){
            if (errLoadSysFunctions){
                callBack(errLoadSysFunctions);
            }
            else{
                self.server.start(callBack);
            }
        });
    };

    this.stop = function(){
        if (this.serverHTTP){
            this.serverHTTP.close();
        }
        this.server.stop();
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

        req.factory = self.server.factory;

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
            console.log("register context " + path);

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

    this._init();
};

module.exports = Server;