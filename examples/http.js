var functionsjs = require("../");
var http = require("http");
var serverHTTP = null;
var factory = null;

factory = functionsjs.getFactoryInstance();
factory.basePATH = "test/functions";

factory.scanAsync(function(errScan, dataScan){
    if (errScan){
        console.error(errScan);
    }
    else{
        console.log(new Date() + " - " + dataScan + " functions loaded");

        serverHTTP = http.createServer(function(req, res){
            functionsjs.httpInvokeFunctionsServer(factory, req, res);
        });

        serverHTTP.listen(8080, function(){
            console.log("HTTP Listen in port 8080");
        });
    }
});