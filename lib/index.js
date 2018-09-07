const core = require("functions-io-core");
const gatewayHTTP = require("functions-io-gateway-http");
const invokeFactory = core.buildInvokeFactory();
const validate = require("./validate");

module.exports.invokeFactory = invokeFactory;
module.exports.gatewayHTTP = gatewayHTTP;

gatewayHTTP.externalHandleEvent.handleMessage = function(message, callBack){
    invokeFactory.invokeMessage(message, callBack);
};

invokeFactory.validate = validate;

module.exports.start = function(callBack){
    gatewayHTTP.start(callBack);
};
