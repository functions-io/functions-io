"use strict";

var assert = require("assert");

module.functionTest = {stage: null, name: "multiply", version:"v1"};
module.test = {};

module.test["test 2 * 3 = 6"] = function(invoke, done){
    invoke({x:2, y:3}, function(err, result){
        try{
            assert.equal(err, null);
            assert.equal(result.value, 6);

            done();
        }
        catch(err){
            done(err);
        }
    })
};

module.test["test 2 * 8 = 16"] = function(invoke, done){
    invoke({x:2, y:8}, function(err, result){
        try{
            assert.equal(err, null);
            assert.equal(result.value, 16);

            done();
        }
        catch(err){
            done(err);
        }
    })
};