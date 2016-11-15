"use strict";

module.name = "subfolder.sum";
module.version = "v1";
module.category = "test";
module.description = "sum";

module.input = {
    x:{type:"integer", required:true},
    y:{type:"integer", required:true}
};
module.output = {
    value:{type:"integer"}
};

module.exports = function(context, message, callBack){
    callBack(null, {value: message.x + message.y});
};