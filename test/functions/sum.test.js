"use strict";

var assert = require("assert");

module.test = {};

module.test["test 2 + 3 = 5"] = function(factory, done){
    factory.invoke(null, "sum", "v1", {x:2, y:3}, null, function(err, result){
        try{
            assert.equal(err, null);
            assert.equal(result.value, 5);

            done();
        }
        catch(err){
            done(err);
        }
    })
};

module.test["test 2 + 8 = 10"] = function(factory, done){
    factory.invoke(null, "sum", "v1", {x:2, y:8}, null, function(err, result){
        try{
            assert.equal(err, null);
            assert.equal(result.value, 10);

            done();
        }
        catch(err){
            done(err);
        }
    })
};