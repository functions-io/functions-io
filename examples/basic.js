var functionsio = require("../");
var app = functionsio({path:"test/functions"});

app.listen(8080, function(err){
    if (!(err)){
        console.log("Listen in port " + app.serverHTTPListen.address().port);
    }
});