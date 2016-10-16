"use strict";

module.info = {
    name: "sum",
    version: "v2",
    category: "test",
    description : "sum"
};

module.input = {
    x:{type:"number", required:false},
    y:{type:"number", required:false}
};
module.output = {
    type:"number"
};

module.exports = function(context, message, callBack){
    callBack(null, message.x + message.y);
};