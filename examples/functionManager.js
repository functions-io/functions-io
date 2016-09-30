var functionsjs = require("../");
var factory;
var functionManager;

factory = functionsjs.getFactoryInstance();
factory.basePATH = "test/functions";

factory.scanAsync(function(errScan, dataScan){
    if (errScan){
        console.log(errScan);
    }
    else{
        console.log(new Date() + " - " + dataScan + " functions loaded");

        functionManager = factory.getFunctionManager("sum", "v1");
        console.log(JSON.stringify(functionManager.module, null, "\t"));
    }
});