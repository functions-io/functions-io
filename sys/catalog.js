"use strict";

module.name = "sys.catalog";
module.category = "sys";
module.description = "catalog";

module.input = {
    stage:{type:"string", required:false},
    name:{type:"string", required:false},
    category:{type:"string", required:false}
};
module.output = {
    list:[
        {type:"stage", required:false},
        {type:"name", required:true},
        {type:"version", required:false}
    ]
};

module.exports = function(context, message, callBack){
    var listCatalog = [];
    var item;
    var newItemCatalog;
    var keys;

    keys = Object.keys(module._factory.listFunctionManager);

    for (var i = 0; i < keys.length; i++){
        item = module._factory.listFunctionManager[keys[i]];

        newItemCatalog = {};
        newItemCatalog.stage = item.stage;
        newItemCatalog.name = item.name;
        newItemCatalog.version = item.version;
        newItemCatalog.description = item.description;
        newItemCatalog.input = item.module.input;
        newItemCatalog.output = item.module.output;
        newItemCatalog.hits = item.hits;

        listCatalog.push(newItemCatalog);
        
        listCatalog.push(newItemCatalog);
    }

    callBack(null, listCatalog);
};