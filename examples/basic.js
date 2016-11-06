var functionsjs = require("../");
var server = functionsjs.createServer({path:"test/functions"});

server.start(8080);