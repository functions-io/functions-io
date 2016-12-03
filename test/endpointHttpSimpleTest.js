var functionsio = require("../");
var assert = require("assert");
var port = null;
var host = "127.0.0.1";
var http = require("http");
var app = functionsio({path:"test/functions", scan:{automatic: false}});

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
    httpPost("application/json", "/sum/v1", JSON.stringify({"x":2,"y":6}), function(errHTTPCode, data){
        assert.equal(errHTTPCode, null);
        assert.equal(data.result.value, 8);
        
        fim();
    });
}