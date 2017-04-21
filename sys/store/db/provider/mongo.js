"use strict";

module.category = "store";
module.name = "store.db.provider.mongo";
module.summary = "mongo store";
module.validatePermission = false;
module.isPrivate = true;

var UtilDB = function(){
    var MongoClient = null;
    var db = null;

    this.getClient = function(context, callBack){
        if (MongoClient === null){
            MongoClient = require('mongodb').MongoClient;
        }

        if (db){
            callBack(null, db);
        }
        else{
            MongoClient.connect(context.global.db.url, function(err, newDB) {
                if (err){
                    callBack(err);
                }
                else{
                    db = newDB;
                    callBack(null, db);
                }
            });
        }
    };
}

var utilDB = new UtilDB();
module.exports = function(context, message, callBack){
    utilDB.getClient(context, callBack);
};