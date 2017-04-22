"use strict";

module.category = "sys";
module.name = "sys.db.findOne";
module.summary = "findOne";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    var provider = "sys.db.provider.mongo";
    if (message.providerDB){
        provider = message.providerDB;
    }
    else if ((context.global.db) && (context.global.db.provider)){
        provider = context.global.db.provider;
    }

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