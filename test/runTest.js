try{
    console.log("Run test...");
    require("./factoryTest");
    require("./endpointHttpTest");
    console.log("Ok");
}
catch(err){
    console.error(err);
}