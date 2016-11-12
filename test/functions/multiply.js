"use strict";

module.name = "multiply";
module.version = "v1";
module.category = "test";
module.description = "multiply";

module.input = {
    x:{type:"number", required:true},
    y:{type:"number", required:true}
};
module.output = {
    type:"number"
};

module.exports = function(context, message, callBack){
    callBack(null, message.x * message.y);
};