"use strict";

module.category = "sys";
module.name = "sys.security.provider.login.mongo";
module.summary = "login provider";
module.validatePermission = false;
module.isPrivate = true;
module.config = {
    collectionName:"user",
    searchByField:"name",
    checkPasswordByField:"password",
    return:{
        fieldSub:"mail",
        fieldName:"name"
    }
};

module.exports = function(context, message, callBack){
    var filter = {};
    filter[module.config.searchByField] = message.userName;

    callBack(null, {user:{id:1, name:"user2"}});
    return;

    context.invoke(null, "sys.db.findOne", null, {objectName:module.config.collectionName, filter:filter}, function(err, data){
        if (err){
            callBack(err);
        }
        else{
            if (data){
                if (data[module.config.checkPasswordByField] === message.password){
                    var user = {};
                    user.sub = message[module.config.return.fieldSub];
                    user.name = message[module.config.return.fieldName];
                    callBack(null, user);
                }
                else{
                    callBack("Password not valid");
                }
            }
            else{
                callBack("User not found");
            }
        }
    });
};