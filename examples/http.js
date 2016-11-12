var functionsio = require("../");
var app = functionsio({path:"test/functions"});
var http = require("http");

app.start(function(err, dataScan){
    if (err){
        console.error(err);
    }
    else{
        console.log(new Date() + " - " + dataScan + " functions loaded");

        app.serverHTTP = http.createServer(app.processRequestHTTP);

        app.factory.invoke(null, "sum", "v1", {x:5,y:5}, function(){}, function(err, result){
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