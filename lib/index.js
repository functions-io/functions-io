const core = require("functions-io-core");
const gatewayHTTP = require("functions-io-gateway-http");
const invokeFactory = core.buildInvokeFactory();
const validate = require("./validate");
const processMessage = require("./processMessage");
const security = require("./security");

//core.config.log.level = core.config.log.levels.DEBUG;

module.exports.invokeFactory = invokeFactory;
module.exports.gatewayHTTP = gatewayHTTP;
module.exports.security = security;

processMessage.invokeFactory = invokeFactory;
processMessage.oauth.login = security.login;

gatewayHTTP.externalHandleEvent.handleMessage = processMessage.process;

invokeFactory.validate = validate;

module.exports.start = function(callBack){
    gatewayHTTP.start(callBack);
};
