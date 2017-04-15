try{
    console.log("Run test...");
    require("./endpointHttpTest");
    require("./endpointHttpSimpleTest");
    console.log("Ok");
}
catch(err){
    console.error(err);
}