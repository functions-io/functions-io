var http = require("http");
var ecstatic = require('ecstatic');

var ServerHTML = function(config){
    this.config = config;
    this.serverHTTP = null;

    if ((this.config === undefined) || (this.config === null)){
        this.config = {};
    }
    if (!(this.config.port)){
        this.config.port = "8081";
    }

    this.start = function(){
        this.serverHTTP = http.createServer(
            ecstatic({root:__dirname + '/html', baseDir: "/"})
        );

        this.serverHTTP.listen(this.config.port);
        console.log('Listening html on ' + this.config.port);
    };

    this.stop = function(){
        if (this.serverHTTP){
            this.serverHTTP.close();
        }
    };
};

module.exports = ServerHTML;