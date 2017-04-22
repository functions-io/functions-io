var Server = require("./Server");
var serverProcessHTTP = require("./serverProcessHTTP");

module.exports.serverProcessHTTP = serverProcessHTTP;

module.exports = function(config){
    if ((config === undefined) || (config === null)){
        
    }
    return new Server(config);
}