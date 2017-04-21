"use strict";

module.category = "store";
module.name = "store.db.findOne";
module.summary = "store findOne";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    var provider = message.providerDB || context.global.db.provider;

    context.invoke(null, provider, null, message, function(errCon, con){
        if (errCon){
            callBack(errCon);
        }
        else{
            con.collection(message.objectName).findOne(message.filter, function(err, document) {
                if (err){
                    callBack(err);
                }
                else{
                    callBack(null, document);
                }
            });
        }
    });
};