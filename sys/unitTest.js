"use strict";

module.name = "sys.unitTest";
module.category = "sys";
module.summary = "run unit test";
module.description = "run unit test";

module.input = {
    name:{type:"string", required:false}
};
module.output = {
    list:{type:"array", required:true, items: {
        description:{type:"string", required:true},
        result:{type:"boolean", required:true},
        err:{type:"string", required:true}
    }}
};

module.exports = function(context, message, callBack){
    var keys;
    var resultTest = {success:true, total:0};
    var listExec = [];
    var functionManager;
    var qtdExec;

    resultTest.success = true;
    resultTest.listResult = [];

    keys = Object.keys(module._factory.listFunctionManager);

    for (var i_function = 0; i_function < keys.length; i_function++){
        functionManager = module._factory.listFunctionManager[keys[i_function]];
        if ((functionManager.stage) && (functionManager.stage === "_UnitTest")){
            listExec.push(functionManager);
        }
    }

    qtdExec = listExec.length;

    var diffTime = 0;
    var start = process.hrtime();

    for (var i = 0; i < qtdExec; i++){
        (function(item){
            item.module.exports(null, null, function(err, data){
                var testInfo;
                
                if (err){
                    testInfo = {};
                    testInfo.success = false;
                    result.listResult = [];
                }
                else{
                    testInfo = data;
                }

                if (testInfo.success === false){
                    resultTest.success = false;
                }

                testInfo.name = item.name;
                resultTest.total += testInfo.listResult.length;
                resultTest.listResult.push(testInfo);

                if (resultTest.listResult.length === qtdExec){
                    diffTime = (process.hrtime(start)[1] / 1000);
                    resultTest.time = diffTime;

                    callBack(null, resultTest);
                }
            });
        })(listExec[i]);
    }
};