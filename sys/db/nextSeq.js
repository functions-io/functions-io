"use strict";

module.category = "sys";
module.name = "sys.db.nextSeq";
module.summary = "nextSeq";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    var provider = message.providerDB || context.global.config.db.provider;

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