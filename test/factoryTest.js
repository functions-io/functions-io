var functionsjs = require("../");
var assert = require("assert");
var functionManager;

var server = functionsjs.createServer({path:"test/functions"});

server.factory.scan(function(errScan, dataScan){
    if (errScan){
        console.log(errScan);
    }
    else{
        console.log(new Date() + " - " + dataScan + " functions loaded");

        functionManager = server.factory.getFunctionManager("sum", "v1");

        assert.equal(functionManager.module.info.category, "test");
        assert.equal(functionManager.module.info.description, "sum");
        assert.equal(functionManager.module.input.x.type, "number");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "number");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.type, "number");
        assert.equal(typeof functionManager.module.exports, "function");
        
        functionManager.module.exports(null, {x:2,y:3}, function(err, data){
            assert.equal(err, null);
            assert.equal(data, 5);
        });

        server.factory.invoke("sum", "v1", {x:2,y:3}, function(){}, function(err, data){
            assert.equal(err, null);
            assert.equal(data, 5);
        });
    }
});