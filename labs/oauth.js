const oauth = require("../lib/security/oauth");

const config = {};
const userObj = {};

config.secretOrPrivateKey = "aaaa";
config.opt = {};
config.opt.algorithm = "HS256";
config.opt.expiresIn = 3600;
config.opt.issuer = "functions-io";
/*
config.opt.expiresIn: expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").
config.opt.notBefore: expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").
config.opt.audience
config.opt.issuer
config.opt.jwtid
config.opt.subject
config.opt.noTimestamp
config.opt.header
config.opt.keyid
config.opt.mutatePayload
*/

userObj.name = "fulano";

let tokenJWT = oauth.generateTokenJWT(config, userObj);
console.log(tokenJWT);

config.secretOrPrivateKey = "aaaa";

console.log(oauth.verifyTokenJWT(config, tokenJWT, function(errVerify, tokenOBJ){
    console.log(errVerify, tokenOBJ);
}));

//callBack