"use strict";

module.category = "sys";
module.name = "sys.db.deleteOne";
module.summary = "deleteOne";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    var provider = message.providerDB || context.global.config.db.provider;

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