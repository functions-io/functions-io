var functionsjs = require("../");
var server = functionsjs.createServer({path:"test/functions"});
var functionManager;

server.factory.scan(function(err, dataScan){
    if (err){
        console.error(err);
    }
    else{
        console.log(new Date() + " - " + dataScan + " functions loaded");

        functionManager = server.factory.getFunctionManager("sum", "v1");
        console.log(JSON.stringify(functionManager.module, null, "\t"));
    }
});