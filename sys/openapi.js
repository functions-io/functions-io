"use strict";

module.returnType = "HTTP";
module.name = "swagger.json";
module.category = "sys";
module.summary = "swagger.json";
module.description = "return swagger.json";

//***********************  TODO
//replace all todos os files propertie por property
//******************

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
            var keysInput;
            var keysOutput;
            var newDefinition;
            var itemNewDefinitionInput = {};
            var itemNewDefinitionOutput = {};
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
                keysInput = Object.keys(itemFunctionManager.module.input);

                itemNewDefinitionInput = {};
                itemNewDefinitionInput.type = "object";
                itemNewDefinitionInput.required = [];
                itemNewDefinitionInput.properties = {};

                openapi_post.parameters.push({"name": "in_" + itemFunctionManager.key, "in": "body", "required": true, "schema": {"$ref": "#/definitions/in_" + itemFunctionManager.key}});
                for (var i_input = 0; i_input < keysInput.length; i_input++){
                    (function(properties, parameters_get, itemInput, inputName){
                        var itemNewParam_get = {};
                        var itemNewProperty = {};
                        
                        itemNewParam_get.in = "query";
                        itemNewParam_get.name = inputName;
                        
                        itemNewParam_get.type = itemInput.type;
                        itemNewProperty.type = itemInput.type;

                        if (itemInput.required){
                            itemNewParam_get.required = itemInput.required;
                            itemNewDefinitionInput.required.push(inputName);
                        }

                        if (itemInput.format){
                            itemNewParam_get.format = itemInput.format;
                            itemNewProperty.format = itemInput.format;
                        }

                        if (itemInput.description){
                            itemNewParam_get.description = itemInput.description;
                            itemNewProperty.description = itemInput.description;
                        }

                        parameters_get.push(itemNewParam_get);
                        properties[inputName] = itemNewProperty;
                    })(itemNewDefinitionInput.properties, openapi_get.parameters, itemFunctionManager.module.input[keysInput[i_input]], keysInput[i_input]);
                }
                specOpenApi.definitions["in_" + itemFunctionManager.key] = itemNewDefinitionInput;
            }

            openapi_get.responses = {};
            openapi_get.responses[200] = {};
            openapi_get.responses[200].description = "Successful response";

            openapi_post.responses = {};
            openapi_post.responses[200] = {};
            openapi_post.responses[200].description = "Successful response";
            
            if (itemFunctionManager.module.output){
                keysOutput = Object.keys(itemFunctionManager.module.output);

                openapi_get.responses[200].schema = {};
                openapi_get.responses[200].schema["$ref"] = "#/definitions/out_msg_" + itemFunctionManager.key;    
                openapi_post.responses[200].schema = {};
                openapi_post.responses[200].schema["$ref"] = "#/definitions/out_msg_" + itemFunctionManager.key;
                
                (function(){
                    var itemNewDefinitionOutput = {};
                    itemNewDefinitionOutput.type = "object";
                    itemNewDefinitionOutput.properties = {};
                    itemNewDefinitionOutput.properties["id"] = {type: "integer", description: "correlation id"};
                    itemNewDefinitionOutput.properties["result"] = {"$ref": "out_" + itemFunctionManager.key};
                    itemNewDefinitionOutput.properties["error"] = {};

                    specOpenApi.definitions["out_msg_" + itemFunctionManager.key] = itemNewDefinitionOutput;
                })();

                itemNewDefinitionOutput = {};
                itemNewDefinitionOutput.type = "object";
                itemNewDefinitionOutput.required = [];
                itemNewDefinitionOutput.properties = {};
                
                for (var i_output = 0; i_output < keysOutput.length; i_output++){
                    (function(properties, itemOutput, outputName){
                        var itemNewProperty = {};
                        itemNewProperty.type = itemOutput.type;
                        if (itemOutput.format){
                            itemNewProperty.format = itemOutput.format;
                        }
                        if (itemOutput.description){
                            itemNewProperty.description = itemOutput.description;    
                        }
                        if (itemOutput.required){
                            itemNewDefinitionOutput.required.push(outputName);
                        }
                        /*"Pets": {"type": "array","items": {"$ref": "#/definitions/Pet"}},*/
                        
                        properties[outputName] = itemNewProperty;
                    })(itemNewDefinitionOutput.properties, itemFunctionManager.module.output[keysOutput[i_output]], keysOutput[i_output]);
                }
                specOpenApi.definitions["out_" + itemFunctionManager.key] = itemNewDefinitionOutput; 
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