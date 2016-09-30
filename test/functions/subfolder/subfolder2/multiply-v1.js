"use strict";

module.info = {
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