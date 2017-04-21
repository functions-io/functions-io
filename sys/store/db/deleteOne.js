"use strict";

module.category = "store";
module.name = "store.db.deleteOne";
module.summary = "store deleteOne";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    var provider = message.providerDB || context.global.db.provider;

    context.invoke(null, provider, null, message, function(errCon, con){
        if (errCon){
            callBack(errCon);
        }
        else{
            con.collection(message.objectName).deleteOne(message.filter, function(err, result) {
                if (err){
                    callBack(err);
                }
                else{
                    callBack(null, {count: result.deletedCount});
                }
            });
        }
    });
};