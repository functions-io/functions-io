const Ajv = require("ajv");
const ajv = new Ajv();

module.exports = function(moduleObj, data){
    if (moduleObj.__manifest.input){
        let validate = ajv.validate(moduleObj.__manifest.input, data);
        if (validate === false){
            let errObj = {};
            errObj.code = -32602; //Invalid params
            errObj.message = "Invalid params";
            errObj.data = ajv.errors;
            return errObj;
        }
        else{
            return null;
        }
    }
    else{
        return null;
    }
};