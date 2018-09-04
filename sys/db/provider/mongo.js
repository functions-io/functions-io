"use strict";

module.category = "sys.db";
module.name = "sys.db.provider.mongo";
module.summary = "mongo provider";
module.validatePermission = false;
module.isPrivate = true;
module.config = {db:{url:"mongodb://localhost:27017/sample"}};

var UtilDB = function(){
    var MongoClient = null;
    var db = null;

    this.getClient = function(context, callBack){
        if (MongoClient === null){
            MongoClient = require("mongodb").MongoClient;
        }

        if (db){
            callBack(null, db);
        }
        else{
            MongoClient.connect(module.config.db.url, function(err, newDB) {
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
};

var utilDB = new UtilDB();
module.exports = function(context, message, callBack){
    utilDB.getClient(context, callBack);
};