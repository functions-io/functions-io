try{
    console.log("Run test...");
    require("./factoryTest");
    require("./endpointHttpTest");
    require("./endpointHttpSimpleTest");
    require("./endpointHttpContextTest");
    console.log("Ok");
}
catch(err){
    console.error(err);
}