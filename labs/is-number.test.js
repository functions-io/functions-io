const functionsio = require("../");

var message = {};
message.id = 1;
message.jsonrpc = "2.0";
message.method = "is-number";
message.version = "*";
message.params = ["aaa1"];

functionsio.invokeFactory.invokeMessage(message, function(errInvoke, messageResponse){
    console.log(errInvoke, messageResponse);
});