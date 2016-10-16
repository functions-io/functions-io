"use strict";

module.info = {
    name: "subfolder.subfolder.multiply",
    version: "v1",
    category: "test",
    description : "multiply"
};

module.input = {
    x:{type:"number", required:true},
    y:{type:"number", required:false}
};
module.output = {
    type:"number"
};

module.exports = function(context, message, callBack){
    callBack(null, message.x * message.y);
};