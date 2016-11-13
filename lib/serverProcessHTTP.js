function getJSONRPCErrorObject(code, message, id){
    var errorJSONRPC = {};
    if (id){
        errorJSONRPC.id = id;
    }
    else{
        errorJSONRPC.id = null;
    }
    errorJSONRPC.error = {};
    errorJSONRPC.error.code = code;
    errorJSONRPC.error.message = message;
    return errorJSONRPC;
};

function process(req, res, next, mountpath){
    try{
        var messageRequest = {};
        var tempArrayURL;
        var tempArrayMethodURL;
        var tempArrayQueryURL;
        var tempArrayQueryParam;
        var bodyRPC = null;

        tempArrayURL = req.url.split("?");
        
        if (mountpath){
            tempArrayMethodURL = tempArrayURL[0].substring(mountpath.length + 1).split("/");
        }
        else{
            tempArrayMethodURL = tempArrayURL[0].substring(1).split("/");
        }

        if (tempArrayURL.length > 1){
            tempArrayQueryURL = tempArrayURL[1].split("&");
        }
        else{
            tempArrayQueryURL = null;
        }
        
        if (req.body){
            try{
                bodyRPC = JSON.parse(req.body);
            }
            catch(errParse){
                res.writeHead(400, {"Content-Type": "application/json"});
                res.end(JSON.stringify(getJSONRPCErrorObject(-32700, "Parse error")));
                return;
            }
        }
        
        messageRequest.id = null;
        messageRequest.method = null;
        messageRequest.version = null;

        if (bodyRPC){
            if ((bodyRPC.jsonrpc) && (bodyRPC.method)){
                //json rpc
                messageRequest.id = bodyRPC.id;
                messageRequest.method = bodyRPC.method;
                messageRequest.params = bodyRPC.params;
                messageRequest.version = bodyRPC.version;
            }
            else{
                if (tempArrayMethodURL.length > 1){
                    messageRequest.method = tempArrayMethodURL[0];
                    messageRequest.version = tempArrayMethodURL[1];
                }
                else{
                    messageRequest.method = tempArrayMethodURL[0];
                    messageRequest.version = null;
                }
                messageRequest.params = bodyRPC;
            }
        }
        else{
            if (tempArrayMethodURL.length > 1){
                messageRequest.method = tempArrayMethodURL[0];
                messageRequest.version = tempArrayMethodURL[1];
            }
            else{
                messageRequest.method = tempArrayMethodURL[0];
                messageRequest.version = null;
            }
            messageRequest.params = {};
            if (tempArrayQueryURL){
                for (var i = 0; i < tempArrayQueryURL.length; i++){
                    tempArrayQueryParam = tempArrayQueryURL[i].split("=");
                    messageRequest.params[tempArrayQueryParam[0]] = tempArrayQueryParam[1];
                }
            }
        }

        messageRequest.header = {};
        messageRequest.header.security = {};
        if (req.headers["Authorization"]){
            messageRequest.header.security.acessToken = req.headers["Authorization"].split(" ")[1];
        }
        else{
            messageRequest.header.security.acessToken = "";
        }

        messageRequest.header.client = {};
        messageRequest.header.client.ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        
        /***Retirar***/
        /***Retirar***/
        /***Retirar***/
        /***Retirar***/
        /***Retirar***/
        console.log("Invoke method " + messageRequest.stage + " - " + messageRequest.method + " - " + messageRequest.version);

        req.factory.invokeMessage(messageRequest, function(messageResponse){
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(messageResponse));

            if (next){
                next(req, res);
            }
        });
    }
    catch(errRequest){
        var responseJSON = {};
        var httpCode = 500;
        
        if (errRequest instanceof ReferenceError){
            httpCode = 404;
            responseJSON = getJSONRPCErrorObject(-32601, errRequest.message);
        }
        else if (errRequest instanceof RangeError){
            httpCode = 400;
            responseJSON = getJSONRPCErrorObject(-32602, errRequest.message);
        }
        else{
            httpCode = 500;
            responseJSON = getJSONRPCErrorObject(-32603, errRequest.message);
        }
        res.writeHead(httpCode, {"Content-Type": "application/json"});
        res.end(JSON.stringify(responseJSON));
    }
};

module.exports = function(req, res, next, mountpath){
    try{
        var body = [];
        req.body = null;

        if (req.method === "POST"){
            req.on("data", function(chunk) {
                body.push(chunk);
            }).on("end", function() {
                if (body.length > 0){
                    req.body = Buffer.concat(body).toString();
                }
                process(req, res, next, mountpath);
            });
        }
        else if (req.method === "GET"){
            process(req, res. next, mountpath);
        }
        else{
            if (next){
                next();
            }
            else{
                res.writeHead(405, {"Content-Type": "application/json"});
                res.end(JSON.stringify(getJSONRPCErrorObject(-32600, "Method Not Allowed")));
            }
        }
    }
    catch(errHTTP){
        res.writeHead(500, {"Content-Type": "application/json"});
        res.end(JSON.stringify(getJSONRPCErrorObject(-32000, errHTTP.message)));
    }
};