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

        functionManager = app.factory.getFunctionManager(null, "sys.stats", null);
        assert.equal(functionManager.module.category, "sys");
        assert.equal(typeof functionManager.module.exports, "function");
        functionManager.module.exports(null, {}, function(err, data){
            assert.equal(err, null);
        });

        functionManager = app.factory.getFunctionManager(null, "swagger.json", null);
        assert.equal(functionManager.module.category, "sys");
        assert.equal(typeof functionManager.module.exports, "function");
        functionManager.module.exports(null, {}, function(err, data){
            assert.equal(err, null);
            assert.equal(data.code, 200);
            assert.equal(typeof(data.body), "string");
        });

        functionManager = app.factory.getFunctionManager(null, "subfolder.subfolder2.sum", "v1");
        assert.equal(functionManager.module.category, "test2");
        assert.equal(functionManager.module.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "subfolder.subfolder2.multiply", "v1");
        assert.equal(functionManager.module.category, "test2");
        assert.equal(functionManager.module.description, "multiply x * y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, false);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "subfolder.sum", "v1");
        assert.equal(functionManager.module.category, "test");
        assert.equal(functionManager.module.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "multiply", "v1");
        assert.equal(functionManager.module.category, "test");
        assert.equal(functionManager.module.description, "multiply x * y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "sum", "v2");
        assert.equal(functionManager.module.category, "test");
        assert.equal(functionManager.module.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, false);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, false);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");

        functionManager = app.factory.getFunctionManager(null, "sum", "v1");
        assert.equal(functionManager.module.category, "test");
        assert.equal(functionManager.module.description, "sum x + y");
        assert.equal(functionManager.module.input.x.type, "integer");
        assert.equal(functionManager.module.input.x.required, true);
        assert.equal(functionManager.module.input.y.type, "integer");
        assert.equal(functionManager.module.input.y.required, true);
        assert.equal(functionManager.module.output.value.type, "integer");
        assert.equal(typeof functionManager.module.exports, "function");
        
        functionManager.module.exports(null, {x:2,y:3}, function(err, data){
            assert.equal(err, null);
            assert.equal(data.value, 5);
        });

        app.factory.invoke(null, "sum", "v1", {x:2,y:3}, null, function(err, data){
            assert.equal(err, null);
            console.log("data => " + data);
            assert.strictEqual(data.value, 5, "igual");
        });
    }
});