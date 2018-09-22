const functionsio = require("../../lib");

var message = {};
message.id = 1;
message.jsonrpc = "2.0";
message.scope = "functions-io-labs";
message.method = "math.sum.async";
message.version = "1.0.0";
message.params = {x:20, y:5};

functionsio.invokeFactory.invokeMessage(message, function(errInvoke, messageResponse){
    console.log(errInvoke, messageResponse);
});