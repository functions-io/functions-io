"use strict";

module.category = "sys.db";
module.name = "sys.db.findOne";
module.summary = "findOne";
module.validatePermission = false;
module.isPrivate = true;
module.config = {
    provider:"sys.db.provider.mongo"
};

module.exports = function(context, message, callBack){
    var provider;
    if (message.providerDB){
        provider = message.providerDB;
    }
    else if ((context.global.db) && (context.global.db.provider)){
        provider = context.global.db.provider;
    }
    else{
        provider = module.config.provider;
    }
    
    context.invoke(null, provider, null, message, function(errCon, con){
        if (errCon){
            callBack(errCon);
        }
        else{
            con.collection(message.objectName).findOne(message.filter, message.fields || undefined, function(err, document) {
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