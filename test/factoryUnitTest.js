var functionsio = require("../");
var app = functionsio({path:"test/functions", autoScan: false});
var assert = require("assert");
var functionManager;

app.start(function(err, dataScan){
    if (err){
        console.error(err);
    }
    else{
        console.log(new Date() + " - " + dataScan + " functions loaded");

        functionManager = app.factory.getFunctionManager("_unitTest", "sum.test", null);
        assert.equal(typeof functionManager.module.test, "object");
        assert.equal(typeof functionManager.module.exports, "function");
        
        app.factory.invoke("_unitTest", "sum.test", null, null, null, function(err, data){
            assert.equal(err, null);
            console.log(data);
        });

        app.factory.invoke("_unitTest", "multiply.test", null, null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.success, true);
        });

        app.factory.invoke(null, "sys.unitTest", null, null, null, function(err, data){
            assert.equal(err, null);
            assert.strictEqual(data.success, true);
        });
    }
});