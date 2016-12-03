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

function appendCORSHeaders(headers, origin){
    if ((headers === undefined) || (headers === null)){
        headers = {};
    }
    if ((origin === undefined) || (origin === null)){
        origin = "*";
    }
    headers["Access-Control-Allow-Headers"] = "Content-Type, api_key, Authorization, x-requested-with, Total-Count, Total-Pages, Error-Message";
    headers["Access-Control-Allow-Methods"] = "POST, GET, DELETE, PUT, OPTIONS";
    headers["Access-Control-Allow-Origin"] = "*";
    return headers
}

function parseMessageError(error){
    var objErr;
    if (error){
        if (error instanceof Error){
            var objErr = {};
            objErr.name = error.name;
            objErr.message = error.message;
            if (error.functionName){
                objErr.functionName = error.functionName;
            }
            if (error.code){
                objErr.code = error.code;
            }
            if (error.attributeName){
                objErr.attributeName = error.attributeName;
            }
            return objErr;
        }
    }

    return error;
}

function process(req, res, next, mountpath){
    try{
        var messageRequest = {};
        var tempArrayURL;
        var tempArrayMethodURL;
        var tempArrayQueryURL;
        var tempArrayQueryParam;
        var responseHeaders = {};
        
        responseHeaders["Content-Type"] = "application/json";
        if (req.factory.enableCORS){
            responseHeaders = appendCORSHeaders(responseHeaders, req.factory.enableCORSFromOrigin);
        }
        
        tempArrayURL = req.url.split("?");
        
        if (mountpath){
            tempArrayMethodURL = tempArrayURL[0].substring(mountpath.length + 1).split("/");
        }
        else{
            tempArrayMethodURL = tempArrayURL[0].substring(1).split("/");
        }

        messageRequest.id = null;
        messageRequest.method = null;
        messageRequest.version = null;
        
        if (tempArrayURL.length > 1){
            messageRequest.params = {};
            tempArrayQueryURL = tempArrayURL[1].split("&");
            for (var i = 0; i < tempArrayQueryURL.length; i++){
                tempArrayQueryParam = tempArrayQueryURL[i].split("=");
                messageRequest.params[tempArrayQueryParam[0]] = tempArrayQueryParam[1];
            }
        }
        
        if ((messageRequest.params) && (messageRequest.params.stage)){
            messageRequest.stage = messageRequest.params.stage;
        }

        if (tempArrayMethodURL.length > 1){
            messageRequest.method = tempArrayMethodURL[0];
            messageRequest.version = tempArrayMethodURL[1];
        }
        else{
            messageRequest.method = tempArrayMethodURL[0];
            messageRequest.version = null;
        }

        if (req.body){
            try{
                if (req.headers["content-type"] === "application/json"){
                    messageRequest.params = JSON.parse(req.body);
                    if ((messageRequest.params.jsonrpc) && (messageRequest.params.method)){
                        //json rpc
                        messageRequest.id = messageRequest.params.id;
                        messageRequest.method = messageRequest.params.method;
                        messageRequest.version = messageRequest.params.version;
                        messageRequest.params = messageRequest.params.params;
                    }
                }
                else{
                    messageRequest.params = req.body;
                }
            }
            catch(errParse){
                res.writeHead(400, responseHeaders);
                res.end(JSON.stringify(getJSONRPCErrorObject(-32700, "Parse error")));
                return;
            }
        }
        
        messageRequest.header = {};
        if (mountpath){
            messageRequest.header.mountpath = mountpath;
        }
        messageRequest.header.security = {};
        if (req.headers["Authorization"]){
            messageRequest.header.security.acessToken = req.headers["Authorization"].split(" ")[1];
        }
        else{
            messageRequest.header.security.acessToken = "";
        }

        messageRequest.header.client = {};
        messageRequest.header.client.ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        
        req.factory.invokeMessage(messageRequest, function(messageResponse, functionManager){
            if (functionManager){
                if ((functionManager.returnType) && (functionManager.returnType === "HTTP")){
                    //response http - custom
                    responseHeaders = {}; //clean headers
                    if (messageResponse.result){
                        responseHeaders = messageResponse.result.headers
                    }
                    if (req.factory.enableCORS){
                        responseHeaders = appendCORSHeaders(responseHeaders, req.factory.enableCORSFromOrigin);
                    }
                    if (messageResponse.error){
                        res.writeHead(500, responseHeaders);
                        res.end(messageResponse.error);
                    }
                    else{
                        if (messageResponse.result.code){
                            res.writeHead(messageResponse.result.code, responseHeaders);
                        }
                        else{
                            res.writeHead(200, responseHeaders);    
                        }
                        res.end(messageResponse.result.body);
                    }
                }
                else{
                    //response message - default
                    messageResponse.error = parseMessageError(messageResponse.error);
                    res.writeHead(200, responseHeaders);
                    res.end(JSON.stringify(messageResponse));
                }
            }
            else{
                //response message - default
                messageResponse.error = parseMessageError(messageResponse.error);
                res.writeHead(200, responseHeaders);
                res.end(JSON.stringify(messageResponse));
            }

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
        res.writeHead(httpCode, responseHeaders);
        res.end(JSON.stringify(responseJSON));
    }
};

module.exports = function(req, res, next, mountpath){
    try{
        if (req.body){
            process(req, res. next, mountpath);
        }
        else
        {
            var body = [];
            req.body = null;
            if ((req.method === "POST") || (req.method === "PUT")){
                req.on("data", function(chunk) {
                    body.push(chunk);
                }).on("end", function() {
                    if (body.length > 0){
                        req.body = Buffer.concat(body).toString();
                    }
                    process(req, res, next, mountpath);
                });
            }
            else{
                process(req, res, next, mountpath);
            }
        }
    }
    catch(errHTTP){
        res.writeHead(500, {"Content-Type": "application/json"});
        res.end(JSON.stringify(getJSONRPCErrorObject(-32000, errHTTP.message)));
    }
};