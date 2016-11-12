var functionsio = require("../");
var app = functionsio({path:"test/functions"});

app.start(function(err, dataScan){
    if (err){
        console.error(err);
    }
    else{
        console.log(new Date() + " - " + dataScan + " functions loaded");

        var functionManager = app.factory.getFunctionManager(null, "sum", "v1");
        
        console.log(JSON.stringify(functionManager.module, null, "\t"));
    }
});