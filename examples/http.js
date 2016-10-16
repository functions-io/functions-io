var functionsjs = require("../");
var http = require("http");
var serverHTTP = null;

var server = functionsjs.createServer({path:"test/functions"});

server.factory.scan(function(err, dataScan){
    if (err){
        console.error(err);
    }
    else{
        console.log(new Date() + " - " + dataScan + " functions loaded");

        serverHTTP = http.createServer(server.processRequestHTTP);

        serverHTTP.listen(8080, function(){
            console.log("HTTP Listen in port 8080");
        });
    }
});