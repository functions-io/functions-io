"use strict";

module.returnType = "HTTP";
module.name = "swagger.json";
module.category = "sys";
module.summary = "swagger.json";
module.description = "return swagger.json";

//***********************  TODO
//replace all todos os files propertie por property
//******************

function getDefinitionMessageResponse(refDefinition){
    var itemNewDefinition = {};
    
    itemNewDefinition.type = "object";
    itemNewDefinition.properties = {};
    itemNewDefinition.properties["id"] = {type: "integer", description: "correlation id"};
    itemNewDefinition.properties["result"] = {"$ref": refDefinition};
    itemNewDefinition.properties["error"] = {type: "string", description: "description error"};

    return itemNewDefinition;
}

function getDefinition(ObjectItem){
    var keys = Object.keys(ObjectItem);
    var definition = {};

    definition.type = "object";
    definition.required = [];
    definition.properties = {};

    for (var i = 0; i < keys.length; i++){
        (function(item, name){
            var itemNewProperty = {};

            itemNewProperty.type = item.type;
            if (item.format){
                itemNewProperty.format = item.format;
            }
            if (item.description){
                itemNewProperty.description = itemOutput.description;    
            }
            if (item.required){
                definition.required.push(name);
            }
            /*"Pets": {"type": "array","items": {"$ref": "#/definitions/Pet"}},*/
            
            definition.properties[name] = itemNewProperty;
        })(ObjectItem[keys[i]], keys[i]);
    }

    return definition;
}

function getParameters(ObjectItem){
    var keys = Object.keys(ObjectItem);
    var parameters = [];

    for (var i = 0; i < keys.length; i++){
        (function(itemInput, inputName){
            var itemNewParam = {};
            
            itemNewParam.in = "query";
            itemNewParam.name = inputName;
            
            itemNewParam.type = itemInput.type;

            if (itemInput.required){
                itemNewParam.required = itemInput.required;
            }

            if (itemInput.format){
                itemNewParam.format = itemInput.format;
            }

            if (itemInput.description){
                itemNewParam.description = itemInput.description;
            }

            parameters.push(itemNewParam);
        })(ObjectItem[keys[i]], keys[i]);
    }

    return parameters;
}

function getSpec(){
    var specOpenApi = {};
    var listCatalog = [];
    var keys;
    
    specOpenApi.swagger = "2.0";
    //specOpenApi.host = "";
    //specOpenApi.basePath = "";
    specOpenApi.info = {};
    specOpenApi.info.version = "0.0.0";
    specOpenApi.info.title = "functions-io";
    specOpenApi.paths = {};
    specOpenApi.definitions = {}; 

    keys = Object.keys(module._factory.listFunctionManager);
    for (var i = 0; i < keys.length; i++){
        (function(itemFunctionManager){
            var newDefinition;
            var openapi_get = {};
            var openapi_post = {};

            if (itemFunctionManager.module.category){
                openapi_get.tags = [itemFunctionManager.module.category]
                openapi_post.tags = [itemFunctionManager.module.category] 
            }
            if (itemFunctionManager.module.summary){
                openapi_get.summary = itemFunctionManager.module.summary;
                openapi_post.summary = itemFunctionManager.module.summary;
            }
            if (itemFunctionManager.module.description){
                openapi_get.description = itemFunctionManager.module.description;
                openapi_post.description = itemFunctionManager.module.description;
            }
            openapi_get.consumes = ["application/json"];
            openapi_get.produces = ["application/json"];
            openapi_post.consumes = ["application/json"];
            openapi_post.produces = ["application/json"];

            //parameters
            openapi_get.parameters = [];
            openapi_post.parameters = [];

            if (itemFunctionManager.module.input){
                openapi_get.parameters = getParameters(itemFunctionManager.module.input);

                openapi_post.parameters.push({"name": "in_" + itemFunctionManager.key, "in": "body", "required": true, "schema": {"$ref": "#/definitions/in_" + itemFunctionManager.key}});
                specOpenApi.definitions["in_" + itemFunctionManager.key] = getDefinition(itemFunctionManager.module.input);
                
            }

            openapi_get.responses = {};
            openapi_get.responses[200] = {};
            openapi_get.responses[200].description = "Successful response";

            openapi_post.responses = {};
            openapi_post.responses[200] = {};
            openapi_post.responses[200].description = "Successful response";
            
            if (itemFunctionManager.module.output){
                openapi_get.responses[200].schema = {};
                openapi_get.responses[200].schema["$ref"] = "#/definitions/out_msg_" + itemFunctionManager.key;    
                openapi_post.responses[200].schema = {};
                openapi_post.responses[200].schema["$ref"] = "#/definitions/out_msg_" + itemFunctionManager.key;
                
                specOpenApi.definitions["out_msg_" + itemFunctionManager.key] = getDefinitionMessageResponse("out_" + itemFunctionManager.key);
                specOpenApi.definitions["out_" + itemFunctionManager.key] = getDefinition(itemFunctionManager.module.output);
            }

            specOpenApi.paths["/" + itemFunctionManager.name + "/" + itemFunctionManager.version] = {get: openapi_get, post: openapi_post};
        })(module._factory.listFunctionManager[keys[i]]);
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