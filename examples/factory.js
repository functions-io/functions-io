var functionsjs = require("../");
var factory;

factory = functionsjs.getFactoryInstance();
factory.basePATH = "test/functions";

factory.scanAsync(function(errScan, dataScan){
    if (errScan){
        console.log(errScan);
    }
    else{
        console.log(new Date() + " - " + dataScan + " functions loaded");

        factory.invoke("sum", "v1", {x:5,y:5}, function(){}, function(err, result){
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