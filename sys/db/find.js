"use strict";

module.category = "sys";
module.name = "sys.db.find";
module.summary = "find";
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
            con.collection(message.objectName).find(message.filter, message.fields || {}).skip(message.skip).limit(message.limit).toArray(function(err, documents) {
                if (err){
                    callBack(err);
                }
                else{
                    callBack(null, {list:documents});
                }
            });
        }
    });
};