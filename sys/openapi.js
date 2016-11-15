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

module.exports = function(context, message, callBack){
    var response = {};
    var openapi = {};

    openapi.swagger = "2.0";
    openapi.info = {};
    openapi.info.version = "0.0.0";
    openapi.info.title = "functions-io";
    openapi.paths = {};

    openapi.paths["/persons"] = {};
    openapi.paths["/persons"].get = {};
    openapi.paths["/persons"].get.description = "Gets `Person` objects.\nOptional query param of **size** determines\nsize of returned array\n";
    openapi.paths["/persons"].parameters = [];
    openapi.paths["/persons"].parameters.push({"name": "size", "in": "query", "description": "Size of array", "required": true, "type": "number", "format": "double"});
    openapi.paths["/persons"].responses = {};
    openapi.paths["/persons"].responses[200] = {};
    openapi.paths["/persons"].responses[200].description = "Successful response";
    openapi.paths["/persons"].responses[200].schema = {};
    openapi.paths["/persons"].responses[200].schema.title = "ArrayOfPersons";
    openapi.paths["/persons"].responses[200].schema.type = "array";
    openapi.paths["/persons"].responses[200].schema.items = {};
    openapi.paths["/persons"].responses[200].schema.items.title = "Person";
    openapi.paths["/persons"].responses[200].schema.items.type = "object";
    openapi.paths["/persons"].responses[200].schema.items.properties = {};
    openapi.paths["/persons"].responses[200].schema.items.properties.name = {};
    openapi.paths["/persons"].responses[200].schema.items.properties.name.type = "string";
    openapi.paths["/persons"].responses[200].schema.items.properties.single = {};
    openapi.paths["/persons"].responses[200].schema.items.properties.single.type = "boolean";

    response.code = 200;
    response.headers = {};
    response.headers["Content-Type"] = "application/json";
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, api_key, Authorization, x-requested-with, Total-Count, Total-Pages, Error-Message";
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, DELETE, PUT, OPTIONS";
    response.headers["Access-Control-Allow-Origin"] = "*";

    response.body = JSON.stringify(openapi);

    callBack(null, response);
};