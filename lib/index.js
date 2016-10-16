var Server = require("./Server");

module.exports.createServer = function(config){
    var server = new Server(config);
    
    return server;
};