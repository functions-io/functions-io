try{
    console.log("Run test...");
    require("./endpointHttpTest");
    require("./endpointHttpTest2");
    require("./endpointHttpSimpleTest");
    require("./endpointHttpContextTest");
    console.log("Ok");
}
catch(err){
    console.error(err);
}