const functionsio = require("../../lib");

//core.config.listRegistry.push({url:"https://127.0.0.1:9443", scope:"my-company"});

var message = {};
message.id = 1;
message.jsonrpc = "2.0";
message.scope = "functions-io-labs";
message.method = "security.login";
message.version = "1.0.0";
message.params = {username:"admin", password:"admin"};

functionsio.invokeFactory.invokeMessage(message, function(errInvoke, messageResponse){
    console.log(errInvoke, messageResponse);
});