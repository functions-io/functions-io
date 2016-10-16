"use strict";

module.info = {
    name: "sum",
    version: "v1",
    category: "test",
    description : "sum"
};

module.input = {
    x:{type:"number", required:true},
    y:{type:"number", required:true}
};
module.output = {
    type:"number"
};

module.exports = function(context, message, callBack){
    callBack(null, message.x + message.y);
};