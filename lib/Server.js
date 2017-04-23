var http = require("http");
var connect = require('connect');
var ecstatic = require('ecstatic');
var functions_io_core = require("functions-io-core");
var serverProcessHTTP = require("./serverProcessHTTP");

var Server = function(config){
    var self = this;

    this.serverHTTP = null;
    this.serverHTTPListen = null;
    this.server = functions_io_core.createServer(config);
    this.app = connect();

    if ((this.server.config.cors === undefined) || (this.server.config.cors === null)){
        this.server.config.cors = {};
        this.server.config.cors.enable = false;
        this.server.config.cors.fromOrigin = "*";
    }
    if ((this.server.config.html === undefined) || (this.server.config.html === null)){
        this.server.config.html = {};
        this.server.config.html.static = "static";
    }
    
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
            this.serverHTTP = null;
        }
        this.server.stop();
    };

    this.listen = function(){
        var argumentsListen = arguments;
        var callBackListen = arguments[arguments.length - 1];

        if (this.serverHTTP === null){
            this.app.use(ecstatic({root:__dirname + "/html", baseDir: "/_admin"}));
            this.app.use(ecstatic({root:process.cwd() + "/static", baseDir: "/" + this.server.config.html.static}));
            this.app.use(self.processRequestHTTP);
            
            this.serverHTTP = http.createServer(this.app);
        }

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

        serverProcessHTTP(req, res, null, self.server.factory, self.server.config);
    };
};

module.exports = Server;