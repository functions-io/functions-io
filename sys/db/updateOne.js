"use strict";

module.category = "sys";
module.name = "sys.db.updateOne";
module.summary = "updateOne";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    var provider = message.providerDB || context.global.config.db.provider;

    context.invoke(null, provider, null, message, function(errCon, con){
        if (errCon){
            callBack(errCon);
        }
        else{
            con.collection(message.objectName).updateOne(message.filter, {$set: message.data}, function(err, result) {
                if (err){
                    callBack(err);
                }
                else{
                    callBack(null, {count: result.modifiedCount});
                }
            });
        }
    });
};