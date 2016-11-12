var functionsio = require("../");

var server = functionsio.createServer({path:"test/functions"});

server.start(function(err, data){
    if (err){
        console.error(errScan);
    }
    else{
        console.log(new Date() + " - " + data + " functions loaded");
    }    
});