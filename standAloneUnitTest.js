var http = require("http");
var fs = require("fs");
var args = process.argv.slice(2);
var file = args[0];
var dirBase = "test/functions";
var name = "";
var path = "";

console.log(file);

name = file.substring(dirBase.length);
name = name.substring(0, name.length - 3);

function httpPost(path, callBack){
    var options = {host: "localhost", port: "8080", path: path, method: "POST", headers: {"Content-Type": "application/json"}};
    
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
    
    req.end();
}

fs.readFile(file, function(err, code){
    if (err){
        console.error(err);
    }
    else{
        path = name + "?stage=_unitTest";
        
        httpPost(path, function(errHTTP, dataHTTP){
            if (errHTTP){
                console.log(errHTTP);
            }
            else{
                console.log(dataHTTP);
                if (dataHTTP.result.success){
                    console.log("unit test - OK");
                }
                else{
                    console.log("unit test - FAIL");
                }
                for (var i = 0; i < dataHTTP.result.listResult.length; i++){
                    console.log(dataHTTP.result.listResult[i]);
                }
            }
        })
    }
});