"use strict";

var assert = require("assert");

module.test = {};

module.test["test 2 * 3 = 6"] = function(factory, done){
    factory.invoke(null, "multiply", "v1", {x:2, y:3}, null, function(err, result){
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

module.test["test 2 * 8 = 16"] = function(factory, done){
    factory.invoke(null, "multiply", "v1", {x:2, y:8}, null, function(err, result){
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