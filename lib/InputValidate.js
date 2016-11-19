"use strict";

//types => integer, long, float, double, string, byte, binary, boolean, date, dateTime, password
function ValidateError(message, functionName, code, attributeName) {
    this.name = "ValidateError";
    this.message = message;
    this.functionName = functionName;
    this.attributeName = attributeName;
    //this.stack = (new Error()).stack;
}
ValidateError.prototype = new Error;  

var InputValidate = function(){
    function process(functionName, data, inputDefinition){
        var keys = Object.keys(inputDefinition);
        var itemDefinition;
        var value;
        var name;

        for (var i = 0; i < keys.length; i++){
            name = keys[i];
            itemDefinition = inputDefinition[name];

            value = data[name];

            if (itemDefinition.required){
                if (value === undefined){
                    throw new ValidateError("Value required", null, 0, name);
                }
            }
            
            if ((itemDefinition.type === "integer") || (itemDefinition.type === "long") || (itemDefinition.type === "float") || (itemDefinition.type === "double")){
                if (typeof(value) !== "number"){
                    if ((itemDefinition.type === "integer") || (itemDefinition.type === "long")){
                        value = parseInt(value);
                    }
                    if ((itemDefinition.type === "float") || (itemDefinition.type === "double")){
                        value = parseFloat(value);
                    }
                    if (isNaN(value)){
                        throw new ValidateError("Value is not " + itemDefinition.type, null, 1, name);
                    }
                    data[name] = value;
                }
            }

            if (itemDefinition.type === "string"){
                if (typeof(value) !== "string"){
                    throw new ValidateError("Value is not string" + itemDefinition.type, null, 1, name);
                }
            }

            if (itemDefinition.type === "boolean"){
                if (typeof(value) !== "boolean"){
                    if (value === "true"){
                        data[name] = true;
                    }
                    else if (value === "false"){
                        data[name] = false;
                    }
                    else{
                        throw new ValidateError("Value is not boolean" + itemDefinition.type, null, 1, name);
                    }
                }
            }

            if ((itemDefinition.type === "date") || (itemDefinition.type === "dateTime")){
                if (!(value instanceof Date)){
                    value = data.parse(value);
                    if (isNaN(value)){
                        throw new ValidateError("Value is not " + itemDefinition.type, null, 1, name);
                    }
                    data[name] = new Date(value);
                }
            }
            
            console.log(itemDefinition.type + " -> " + value);
        }
        console.log(data);
        return data;
    }

    this.parse = function(functionName, data, inputDefinition){
        if (inputDefinition){
            return process(functionName, data, inputDefinition);
        }
        else{
            return data;
        }
    };
};

module.exports = InputValidate;