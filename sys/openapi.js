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
            var itemNewDefinition = {};
            var openapi_get = {};

            if (itemFunctionManager.module.category){
                openapi_get.tags = [itemFunctionManager.module.category]
            }
            if (itemFunctionManager.module.summary){
                openapi_get.summary = itemFunctionManager.module.summary;
            }
            if (itemFunctionManager.module.description){
                openapi_get.description = itemFunctionManager.module.description;
            }
            openapi_get.consumes = ["application/json"];
            openapi_get.produces = ["application/json"];

            //parameters
            openapi_get.parameters = [];
            if (itemFunctionManager.module.input){
                keysInput = Object.keys(itemFunctionManager.module.input);
                for (var i_input = 0; i_input < keysInput.length; i_input++){
                    (function(parameters, itemInput, inputName){
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
                    })(openapi_get.parameters, itemFunctionManager.module.input[keysInput[i_input]], keysInput[i_input]);
                }
            }


            openapi_get.responses = {};
            openapi_get.responses[200] = {};
            openapi_get.responses[200].description = "Successful response";
            
            if (itemFunctionManager.module.output){
                keysOutput = Object.keys(itemFunctionManager.module.output);

                openapi_get.responses[200].schema = {};
                openapi_get.responses[200].schema["$ref"] = "#/definitions/" + itemFunctionManager.key;    
                itemNewDefinition = {};
                itemNewDefinition.type = "object";
                itemNewDefinition.required = [];
                itemNewDefinition.properties = {};
                
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
                            itemNewDefinition.required.push(outputName);
                        }
                        /*"Pets": {"type": "array","items": {"$ref": "#/definitions/Pet"}},*/
                        
                        properties[outputName] = itemNewProperty;
                    })(itemNewDefinition.properties, itemFunctionManager.module.output[keysOutput[i_output]], keysOutput[i_output]);
                }
                specOpenApi.definitions[itemFunctionManager.key] = itemNewDefinition; 
            }

            specOpenApi.paths["/" + itemFunctionManager.name + "/" + itemFunctionManager.version] = {get: openapi_get};
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