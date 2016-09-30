var functionsjs = require("../");
var assert = require("assert");
var port = 8187;
var host = "127.0.0.1";
var http = require("http");
var controlFunctions = null;

function httpPost(messageType, path, data, callBack){
    var options = {
        host: host,
        port: port,
        path: path,
        method: "POST",
        headers: {
            "Content-Type": messageType,
            "Content-Length": Buffer.byteLength(data)
        }
    };
    
    var req = http.request(options, function(res) {
        var data = "";
        res.setEncoding("utf8");
        res.on("data", function (chunk) {
            data += chunk; 
        });
        res.on("end", function () {
            if (res.statusCode === 200){
                callBack(null, JSON.parse(data));
            }
            else{
                callBack(res.statusCode, JSON.parse(data));
            }
        });
    });
    
    req.write(data);
    req.end();
}

try{
    functionsjs.listen({path:"test/functions", port: port}, function(err, control){
        assert.equal(err, null);

        controlFunctions = control;
        test1();
    });
}
catch(err){
    console.err(err);
    fim();    
}

function fim(){
    if (controlFunctions){
        controlFunctions.serverHTTP.close();
    }
}

function test1(){
    httpPost("application/json", "/", "", function(errHTTPCode, data){
        assert.equal(errHTTPCode, 400);
        assert.equal(data.error.code, -32602); //Invalid params
        test2();
    });
}

function test2(){
    httpPost("application/json", "/", "{haha", function(errHTTPCode, data){
        assert.equal(errHTTPCode, 400);
        assert.equal(data.error.code, -32700); //Parse error
        
        test3();
    });
}

function test3(){
    httpPost("application/json", "/methodNotExist/v1", JSON.stringify({"x":2,"y":6}), function(errHTTPCode, data){
        assert.equal(errHTTPCode, 404);
        assert.equal(data.error.code, -32601); //Method not found
        
        test4();
    });
}

function test4(){
    httpPost("application/json", "/sum/v1", JSON.stringify({"x":2,"y":6}), function(errHTTPCode, data){
        assert.equal(errHTTPCode, null);
        assert.equal(data.result, 8);
        
        fim();
    });
}