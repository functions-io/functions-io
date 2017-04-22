"use strict";

module.category = "sys";
module.name = "sys.security.login";
module.summary = "login";

module.input = {
    userName:{type:"string", required:true},
    password:{type:"string", required:true}
};

module.output = {
    token:{type:"string", required:true}
}

module.exports = function(context, message, callBack){
    console.log("login => ");
    console.log(message);
    //context.invoke(null, "sys.db.findOne", null, {objectName:module.objectName, filter:{_id:message.id}}, callBack);
};