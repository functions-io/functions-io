"use strict";

module.category = "sys.db";
module.name = "sys.db.nextSeq";
module.summary = "nextSeq";
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
            con.collection("sequence").findOneAndUpdate({"_id": message.objectName}, {$inc:{"seq":1}}, {upsert:true, new:true}, function(err, documents) {
                if (err){
                    callBack(err);
                }
                else{
                    callBack(null, documents.value.seq);
                }
            });
        }
    });
};