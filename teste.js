var fs = require("fs");

fs.watch("/tmp/tmp2", monitor);
fs.watch("/tmp/tmp2/subfolder", monitor);

function monitor(eventType, filename){
    console.log(eventType);
    console.log(filename);
    console.log("");
}