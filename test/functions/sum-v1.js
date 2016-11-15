"use strict";

module.name = "sum";
module.version = "v1";
module.category = "test";
module.description = "sum";

module.input = {
    x:{type:"number", required:true},
    y:{type:"number", required:true},
    generic:{type:"number", required:true, format: "double", description: "par generic"}
};
module.output = {
    type:"number"
};

module.exports = function(context, message, callBack){
    callBack(null, message.x + message.y);
};