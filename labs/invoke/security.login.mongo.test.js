const functionsio = require("../../lib");

var message = {};
message.id = 1;
message.jsonrpc = "2.0";
message.scope = "functions-io-modules";
message.method = "security.login.mongo";
message.version = "1.*";
message.params = {username:"admin", password:"admin"};

functionsio.invokeFactory.invokeMessage(message, function(errInvoke, messageResponse){
    console.log(errInvoke, messageResponse);
});