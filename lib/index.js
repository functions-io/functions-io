const core = require("functions-io-core");
const gatewayHTTP = require("functions-io-gateway-http");
const invokeFactory = core.buildInvokeFactory();
const validate = require("./validate");
const processMessage = require("./processMessage");
const user = require("./security/user");
const oauth = require("./security/oauth");

//core.config.log.level = core.config.log.levels.DEBUG;

module.exports.invokeFactory = invokeFactory;
module.exports.gatewayHTTP = gatewayHTTP;
module.exports.user = {};
module.exports.user.login = user.login;
module.exports.oauth = {};
module.exports.oauth.login = oauth.login;
module.exports.oauth.config = {};
module.exports.oauth.config.secretOrPrivateKey = "aaaa";
module.exports.oauth.config.opt = {};
module.exports.oauth.config.opt.algorithm = "HS256";
module.exports.oauth.config.opt.expiresIn = 3600;
module.exports.oauth.config.opt.issuer = "functions-io";

processMessage.invokeFactory = module.exports.invokeFactory;
processMessage.user.login = module.exports.user.login;
processMessage.oauth.login = module.exports.oauth.login;
processMessage.oauth.config = module.exports.oauth.config;

gatewayHTTP.externalHandleEvent.handleMessage = processMessage.process;

invokeFactory.validate = validate;

module.exports.start = function(callBack){
    gatewayHTTP.start(callBack);
};
