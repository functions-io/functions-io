const functionsio = require("../lib");

var message = {};
message.id = 1;
message.jsonrpc = "2.0";
message.method = "uuid/v44";
message.params = [null, null, null];

functionsio.invokeFactory.invokeMessage(message, function(errInvoke, messageResponse){
    console.log(errInvoke, messageResponse);
});