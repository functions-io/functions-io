"use strict";

module.category = "sys.security";
module.name = "sys.security.provider.login.mongo";
module.summary = "login provider";
module.validatePermission = false;
module.isPrivate = true;
module.config = {
    hashAlgorithm:"sha256",
    collectionName:"security.user",
    searchByField:"name",
    checkPasswordByField:"password",
    returnFields:{"name":true,"mail":true}
};

var crypto = require("crypto");
module.exports = function(context, message, callBack){
    var filter = {};
    var fields = {};

    filter[module.config.searchByField] = message.userName;
    Object.assign(fields, module.config.returnFields);
    fields[module.config.checkPasswordByField] = true;

    context.invoke(null, "sys.db.findOne", null, {objectName:module.config.collectionName, filter:filter, fields:fields}, function(err, data){
        if (err){
            callBack(err);
        }
        else{
            if (data){
                var passwordHash = crypto.createHash(module.config.hashAlgorithm).update(message.password).digest("base64");
                
                if (data[module.config.checkPasswordByField] === passwordHash){
                    delete data[module.config.checkPasswordByField];
                    callBack(null, data);
                }
                else{
                    callBack({code:2, message:"Invalid username or password"});
                }
            }
            else{
                callBack({code:1, message:"Invalid username or password"});
            }
        }
    });
};