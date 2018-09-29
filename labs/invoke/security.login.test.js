const functionsio = require("../../lib");

var message = {};
message.id = 1;
message.jsonrpc = "2.0";
message.scope = "functions-io-labs";
message.method = "security.login";
message.version = "1.0.0";
message.params = {username:"admin", password:"admin"};

var timeInit = new Date().getTime();
functionsio.invokeFactory.invokeMessage(message, function(errInvoke, messageResponse){
    console.log("Response in " + (new Date().getTime() - timeInit) + "ms");
    console.log(errInvoke, messageResponse);
});