var http = require("http");
var FunctionsFactory = require("./factory/FunctionsFactory");
var Monitor = require("./factory/Monitor");
var httpInvokeFunctionsServer = require("./endpoint/httpInvokeFunctionsServer");

var Server = function(config){
    this.factory = null;
    this.serverHTTP = null;
    this.factory = new FunctionsFactory();
    this.monitor = new Monitor(this.factory);

    var self = this;

    if ((config === undefined) || (config === null)){
        config = {};
    }
    if (config.isGenerateStatistics){
        this.factory.functionManagerFactory.isGenerateStatistics = config.isGenerateStatistics;
    }
    if (config.path){
        this.factory.basePATH = config.path;
    }

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

        httpInvokeFunctionsServer(self.factory, req, res);
    };
};

module.exports = Server;