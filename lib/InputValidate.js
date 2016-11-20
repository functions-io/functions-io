"use strict";

//types => integer, long, float, double, string, byte, binary, boolean, date, dateTime, password

var InputValidate = function(){
    this.parse = function(functionName, dataParse, inputDefinition){
        var error = null;
        var dataParsed = null;

        function process(data, inputDefinition){
            var keys = Object.keys(inputDefinition);
            var itemDefinition;
            var value;
            var name;

            for (var i = 0; i < keys.length; i++){
                name = keys[i];
                itemDefinition = inputDefinition[name];

                value = data[name];

                if (itemDefinition.required){
                    if ((value === undefined) || (value === null)){
                        error = {name:"ValidateError", message:"Value required", code:0, functionName:functionName, attributeName:name};
                        return null;
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
                            error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                            return null;
                        }
                        data[name] = value;
                    }
                }

                if (itemDefinition.type === "string"){
                    if (typeof(value) !== "string"){
                        error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                        return null;
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
                            error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                            return null;
                        }
                    }
                }

                if ((itemDefinition.type === "date") || (itemDefinition.type === "dateTime")){
                    if (!(value instanceof Date)){
                        value = Date.parse(value);
                        if (isNaN(value)){
                            error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                            return null;
                        }
                        data[name] = new Date(value);
                    }
                }

                if (itemDefinition.type === "array"){
                    if (Array.isArray(value)){
                        for (var i_array = 0; i_array < value.length; i_array++){
                            data[name][i_array] = process(value[i_array], itemDefinition.items);
                            if (data[name][i_array] === null){
                                return null;
                            }
                        }
                    }
                    else{
                        error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                        return null;
                    }
                }

                if (itemDefinition.type === "object"){
                    if ((typeof(value) === "undefined") || (typeof(value) === "null") || (typeof(value) === "object")){
                        if (itemDefinition.required === true && typeof(value) !== "object"){
                            error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                        }
                        else{
                            if (value){
                                value = process(value, itemDefinition.properties);
                                if (value === null){
                                    return null;
                                }
                                else{
                                    data[name] = value;
                                }
                            }
                        }
                    }
                    else{
                        error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                        return null;
                    }
                }

                if (Array.isArray(itemDefinition.enum)){
                    for (var i_enum = 0; i_enum < itemDefinition.enum.length; i_enum++){
                        if (value === itemDefinition.enum[i_enum]){
                            i_enum = -1;
                            break;
                        }
                    }
                    if (i_enum >= 0){
                        error = {name:"ValidateError", message:"Value is not in domain", code:2, functionName:functionName, attributeName:name};
                        return;
                    }
                }

                //console.log("debug => " + itemDefinition.type + " -> " + value);
            }
            //console.log(data);
            return data;
        }

        if (inputDefinition){
            dataParsed = process(dataParse, inputDefinition); 
        }
        else{
            dataParsed = dataParse;
        }

        return {error: error, data: dataParsed};
    };
};

module.exports = InputValidate;