"use strict";

module.category = "store";
module.name = "store.db.insertOne";
module.summary = "store insertOne";
module.validatePermission = false;
module.isPrivate = true;

module.exports = function(context, message, callBack){
    var provider = message.providerDB || context.global.db.provider;

    context.invoke(null, provider, null, message, function(errCon, con){
        if (errCon){
            callBack(errCon);
        }
        else{
            try{
                if (message.autoGenerateSeq && (message.data._id === undefined || message.data._id === null)){
                    con.collection("sequence").findOneAndUpdate({"_id": message.objectName}, {$inc:{"seq":1}}, {upsert:true, new:true}, function(err, documents) {
                        try{
                            if (err){
                                callBack(err);
                            }
                            else{
                                if (documents.value){
                                    message.data._id = documents.value.seq + 1;
                                }
                                else{
                                    message.data._id = 1;
                                }

                                con.collection(message.objectName).insertOne(message.data, function(err, result) {
                                    if (err){
                                        callBack(err);
                                    }
                                    else{
                                        callBack(null, {id:result.insertedId.toString()});
                                    }
                                });
                            }
                        }
                        catch(insertOne2){
                            callBack(insertOne2);
                        }
                    });
                }
                else{
                    con.collection(message.objectName).insertOne(message.data, function(err, result) {
                        if (err){
                            callBack(err);
                        }
                        else{
                            callBack(null, {id:result.insertedId.toString()});
                        }
                    });
                }
            }
            catch(insertOne){
                callBack(insertOne);
            }
        }
    });
};