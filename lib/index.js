const core = require("functions-io-core");
const gatewayHTTP = require("functions-io-gateway-http");
const invokeFactory = core.buildInvokeFactory();
const Ajv = require("ajv");

const ajv = new Ajv();

module.exports.invokeFactory = invokeFactory;
module.exports.gatewayHTTP = gatewayHTTP;

gatewayHTTP.externalHandleEvent.handleMessage = function(message, callBack){
    invokeFactory.invokeMessage(message, callBack);
};

invokeFactory.validate = function(moduleObj, data, context, callBack){
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

module.exports.start = function(callBack){
    gatewayHTTP.start(callBack);
};
