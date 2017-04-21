var functions_io_core = require("functions-io-core");
var http = require("http");
var serverProcessHTTP = require("./serverProcessHTTP");
var ServerHTML = require("./ServerHTML");

var Server = function(config){
    this.config = config;
    this.serverHTTP = null;
    this.serverHTTPListen = null;
    this.serverHTML = null;
    this.server = null;

    var self = this;
    
    if ((this.config === undefined) || (this.config === null)){
        this.config = {};
    }
    if ((this.config.cors === undefined) || (this.config.cors === null)){
        this.config.cors = {};
        this.config.cors.enable = true;
        this.config.cors.fromOrigin = "*";
    }
    if ((this.config.html === undefined) || (this.config.html === null)){
        this.config.html = {};
        this.config.html.enable = true;
        this.config.html.port = "8081";
    }
    if ((this.config.db === undefined) || (this.config.db === null)){
        this.config.db = {};
    }
    if ((this.config.db.provider === undefined) || (this.config.db.provider === null)){
        this.config.db.provider = "store.db.provider.mongo";
    }
    if ((this.config.db.url === undefined) || (this.config.db.url === null)){
        this.config.db.provider = "mongodb://localhost:27017/sample";
    }

    this.server = functions_io_core.createServer(this.config);

    this.start = function(callBack){
        if ((this.config.html) && (this.config.html.enable)){
            this.serverHTML = new ServerHTML(this.config.html);
            this.serverHTML.start();
        }

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
            this.serverHTTP = null;
        }
        if (this.serverHTML){
            this.serverHTML.stop();
            this.serverHTML = null;
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
            try{
                console.error(errReq);
                res.statusCode = 400;
                res.end();
            }
            catch(errReqHandle){
                console.error(errReqHandle);
            }
        });

        serverProcessHTTP(req, res, null, self.server.factory, self.config);
    };
};

module.exports = Server;