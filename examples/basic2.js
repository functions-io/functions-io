var functionsjs = require("../");
var server = functionsjs.createServer({path:"test/functions"});

server.factory.scan(function(err){
    if (err){
        console.error(err);
    }
    else{
        server.listen(8080);
        console.log("Server online in port " + server.serverHTTP.address().port);
    }
});