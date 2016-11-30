var fs = require("fs");
var path = require("path");
var contentTypeByExtension = {};
contentTypeByExtension[".HTML"] = "text/html;charset=utf-8";
contentTypeByExtension[".JS"] = "application/javascript; charset=utf-8";
contentTypeByExtension[".CSS"] = "text/css";
contentTypeByExtension[".PNG"] = "image/png";

function processFiles(context, basePATH, req, res, next){
    var uri;
    var responseHeaders = {};
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
                    fs.readFile(uri, function(err, data){
                        if (err){
                            res.writeHead(500, {"Content-Type": "text/html"});
                            res.end(err.message);
                        }
                        else{
                            responseHeaders["Content-Type"] = contentTypeByExtension[fileExtension];
                            responseHeaders["Content-Length"] = data.length;

                            res.writeHead(200, responseHeaders);

                            res.end(data, "binary");
                        }
                    });
                }
                else{
                    if (next){
                        next();
                    }
                    else{
                        res.writeHead(404, {"Content-Type": "text/html"});
                        res.end("Not Found");
                    }
                }
            }
        });
    }
    catch(err){
        res.writeHead(500, {"Content-Type": "text/html"});
        res.end(err.message);
    }
}

module.exports = function(req, res, next, mountpath){
    if (!(mountpath)){
        mountpath = "";
    }

    if (req.headers["content-type"] !== "application/json"){
        if (req.url.indexOf(mountpath + "/lib") === 0){
            processFiles(mountpath + "/lib", "html/lib", req, res, next);
            return;
        }
        else if (req.url.indexOf(mountpath + "/admin") === 0){
            processFiles(mountpath + "/admin", "html/admin", req, res, next);
            return;
        }
        else if (req.url.indexOf(mountpath + "/catalog") === 0){
            processFiles(mountpath + "/catalog", "html/catalog", req, res, next);
            return;
        }
        else if (req.url.indexOf(mountpath + "/test") === 0){
            processFiles(mountpath + "/test", "html/test", req, res, next);
            return;
        }
    }
    
    if (next){
        next();
    }
};