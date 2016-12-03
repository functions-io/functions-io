var functionsio = require("../");
var assert = require("assert");
var port = null;
var host = "127.0.0.1";
var http = require("http");
var app = functionsio({path:"test/functions", scan:{automatic: false}, mountpath:"/api"});

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
    app.listen(function(err){
        if (err){
            console.error(err);
        }
        else{
            port = app.serverHTTPListen.address().port;
            console.log("Listen in port " + port);
            test1();
        }
    });
}
catch(err){
    console.err(err);
    fim();    
}

function fim(){
    if (app){
        app.stop();
    }
}

function test1(){
    httpPost("application/json", "/api/", "", function(errHTTPCode, data){
        assert.equal(errHTTPCode, 400);
        assert.equal(data.error.code, -32602); //Invalid params
        test2();
    });
}

function test2(){
    httpPost("application/json", "/api/", "{haha", function(errHTTPCode, data){
        assert.equal(errHTTPCode, 400);
        assert.equal(data.error.code, -32700); //Parse error
        
        test3();
    });
}

function test3(){
    httpPost("application/json", "/api/methodNotExist", JSON.stringify({"x":2,"y":6}), function(errHTTPCode, data){
        assert.equal(errHTTPCode, 404);
        assert.equal(data.error.code, -32601); //Method not found
        
        test4();
    });
}

function test4(){
    httpPost("application/json", "/api/sum/v1", JSON.stringify({"x":2,"y":6}), function(errHTTPCode, data){
        assert.equal(errHTTPCode, null);
        assert.equal(data.result.value, 8);
        
        test5();
    });
}

function test5(){
    httpPost("application/json", "/api/subfolder.sum/v1", JSON.stringify({"x":2,"y":6}), function(errHTTPCode, data){
        assert.equal(errHTTPCode, null);
        assert.equal(data.result.value, 8);
        
        fim();
    });
}