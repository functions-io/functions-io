var fs = require("fs");
var path = require("path");
var contentTypeByExtension = {};
contentTypeByExtension[".HTML"] = "text/html;charset=utf-8";
contentTypeByExtension[".JS"] = "application/javascript; charset=utf-8";
contentTypeByExtension[".CSS"] = "text/css";
contentTypeByExtension[".PNG"] = "image/png";

function processFiles(context, basePATH, req, res){
    var uri;
    var responseContentType;
    var fileExtension;

    try{
        uri = req.url.substring(context.length);
        if ((uri === "") || (uri === "/")){
            uri = "index.html";
        }

        fileExtension = uri.substring(uri.lastIndexOf(".")).toUpperCase();
        uri = path.join(__dirname, basePATH + "/" + uri);

        fs.stat(uri, function(err, stats){
            if (err){
                res.writeHead(404, {"Content-Type": "text/html"});
                res.end("Not Found");
            }
            else{
                if (stats.isFile()){
                    fs.readFile(uri, "utf8", function(err, data){
                        if (err){
                            res.writeHead(500, {"Content-Type": "text/html"});
                            res.end(err.message);
                        }
                        else{
                            responseContentType = contentTypeByExtension[fileExtension];

                            res.writeHead(200, {"Content-Type": responseContentType});
                            res.end(data);
                        }
                    });
                }
                else{
                    res.writeHead(404, {"Content-Type": "text/html"});
                    res.end("Not Found");
                }
            }
        });
    }
    catch(err){
        res.writeHead(500, {"Content-Type": "text/html"});
        res.end(err.message);
    }
}

module.exports = function(req, res, next){
    if (req.headers["content-type"] !== "application/json"){
        if (req.url.indexOf("/admin") === 0){
            processFiles("/admin", "htmlFiles", req, res);
            return;
        }
        else if (req.url === "/"){
            res.writeHead(301, {"Location": "/admin"});
            res.end();
            return;
        }
    }
    
    next();
};