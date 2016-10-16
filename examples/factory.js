var functionsjs = require("../");
var server = functionsjs.createServer({path:"test/functions"});

server.factory.scan(function(err, dataScan){
    if (err){
        console.error(err);
    }
    else{
        console.log(new Date() + " - " + dataScan + " functions loaded");

        server.factory.invoke("sum", "v1", {x:5,y:5}, function(){}, function(err, result){
            if (err){
                console.log("Err => ");
                console.log(err);
            }
            else{
                console.log("Resp => ");
                console.log(result);
            }
        });
    }
});