var Server = require("./Server");
var serverProcessHTTP = require("./serverProcessHTTP");

module.exports.serverProcessHTTP = serverProcessHTTP;

module.exports = function(config){
    return new Server(config);
}