const functionsio = require("../../lib");

var message = {};
message.id = 1;
message.jsonrpc = "2.0";
message.method = "cuid";
message.params = [];

var timeInit = new Date().getTime();
functionsio.invokeFactory.invokeMessage(message, function(errInvoke, messageResponse){
    console.log("Response in " + (new Date().getTime() - timeInit) + "ms");
    console.log(errInvoke, messageResponse);
});