const Ajv = require("ajv");
const ajv = new Ajv();

module.exports = function(moduleObj, data, context, callBack){
    if (moduleObj.__manifest.input){
        let validate = ajv.validate(moduleObj.__manifest.input, data);
        if (validate === false){
            let errObj = {};
            errObj.code = -32602; //Invalid params
            errObj.message = "Invalid params";
            errObj.details = ajv.errors;
            callBack(errObj);
            return;
        }
    }

    callBack(null);
};