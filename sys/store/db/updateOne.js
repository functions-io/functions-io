"use strict";

module.category = "store";
module.name = "store.db.updateOne";
module.summary = "store updateOne";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    var provider = message.providerDB || context.global.db.provider;

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