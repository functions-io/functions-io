"use strict";

module.category = "sys.db";
module.name = "sys.db.deleteOne";
module.summary = "deleteOne";
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
            con.collection(message.objectName).deleteOne(message.filter, function(err, result) {
                try{
                    if (err){
                        callBack(err);
                    }
                    else{
                        callBack(null, {count: result.deletedCount});
                    }
                }
                catch(errDB){
                    callBack(errDB);
                }
            });
        }
    });
};