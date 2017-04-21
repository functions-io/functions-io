"use strict";

module.category = "sys";
module.name = "sys.db.findOne";
module.summary = "findOne";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    var provider = message.providerDB || context.global.config.db.provider;

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