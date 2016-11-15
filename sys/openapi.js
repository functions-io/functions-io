"use strict";

module.returnType = "HTTP";
module.name = "sys.openapi";
module.category = "sys";
module.description = "openapi";

module.input = {
    stage:{type:"string", required:false},
    name:{type:"string", required:false},
    category:{type:"string", required:false}
};

function parse_verb_get(itemFunctionManager){
    var openapi = {};
    var keys = null;
    var item;

    /*
    newItemCatalog = {};
    newItemCatalog.stage = item.stage;
    newItemCatalog.name = item.name;
    newItemCatalog.version = item.version;
    newItemCatalog.description = item.description;
    newItemCatalog.input = item.module.input;
    newItemCatalog.output = item.module.output;
    */

/*
"name": "size", 
        "in": "query",
        "description": "Size of array",
        "required": true,
        "type": "number",
        "format": "double"

module.input = {
    x:{type:"number", required:true},
    y:{type:"number", required:true},
    generic:{type:"number", required:true, format: "double"}
};
*/

    openapi.get = {};
    openapi.get.description = itemFunctionManager.module.description;
    openapi.parameters = [];

    keys = Object.keys(itemFunctionManager.module.input);
    for (var i = 0; i < keys.length; i++){
        item = itemFunctionManager.module.input[keys[i]];
        
        var itemNewParam = {};
        itemNewParam.in = "query";
        itemNewParam.name = keys[i];
        itemNewParam.type = item.type;
        itemNewParam.required = item.required;
        itemNewParam.format = item.format;
        itemNewParam.description = item.description;

        openapi.parameters.push(itemNewParam);
    }

    /*
    openapi.parameters.push({
        "name": "size", 
        "in": "query",
        "description": "Size of array",
        "required": true,
        "type": "number",
        "format": "double"
    });
    */

    openapi.responses = {};
    openapi.responses[200] = {};
    openapi.responses[200].description = "Successful response";
    openapi.responses[200].schema = {};
    openapi.responses[200].schema.title = "ArrayOfPersons";
    openapi.responses[200].schema.type = "array";
    openapi.responses[200].schema.items = {};
    openapi.responses[200].schema.items.title = "Person";
    openapi.responses[200].schema.items.type = "object";
    openapi.responses[200].schema.items.properties = {};
    openapi.responses[200].schema.items.properties.name = {};
    openapi.responses[200].schema.items.properties.name.type = "string";
    openapi.responses[200].schema.items.properties.single = {};
    openapi.responses[200].schema.items.properties.single.type = "boolean";

    return openapi;
};

function getSpec(){
    var specOpenApi = {};
    var listCatalog = [];
    var item;
    var keys;

    specOpenApi.swagger = "2.0";
    specOpenApi.info = {};
    specOpenApi.info.version = "0.0.0";
    specOpenApi.info.title = "functions-io";
    specOpenApi.paths = {};

    keys = Object.keys(module._factory.listFunctionManager);
    for (var i = 0; i < keys.length; i++){
        item = module._factory.listFunctionManager[keys[i]];

        specOpenApi.paths["/" + item.name + "/" + item.version] = parse_verb_get(item);
    }

    return specOpenApi;
}

module.exports = function(context, message, callBack){
    var response = {};
    var spec = null;

    spec = getSpec();

    response.code = 200;
    response.headers = {};
    response.headers["Content-Type"] = "application/json";
    
    response.body = JSON.stringify(spec);

    callBack(null, response);
};