module.exports = function(context, message, callBack){
    var keys;
    var qtdTest;
    var factory = this._factory;
    var functionTest = this.functionTest;
    var resultTest = {};
    var test = this.test;
    var after = this.after;
    
    resultTest.success = true;
    resultTest.listResult = [];

    keys = Object.keys(test);
    qtdTest = keys.length;

    var invoke = function(stage, name, version, dataInvoke, callBackInvoke){
        factory.invoke(stage, name, version, dataInvoke, context, callBackInvoke);
    }

    var run = function(indexRun, callBackRun){
        try{
            var start = process.hrtime();
            var key = keys[indexRun];
            var itemRun = test[key];
            
            itemRun(invoke, function(err){
                var result = {};
                if (err){
                    result.success = false;
                    result.error = err.message;
                    resultTest.success = false;
                }
                else{
                    result.success = true;
                }
                
                result.description = key;
                result.time = (process.hrtime(start)[1] / 1000);
                resultTest.listResult.push(result);

                callBackRun(err);
            }, context);
        }
        catch(errCallTest){
            callError(errCallTest);
        }
    }

    var runAll = function(callBack){
        var cont;
        for (var i = 0; i < qtdTest; i++){
            run(i, function(){
                cont++;
                if (cont === qtdTest){
                    if (after){
                        try{
                            after(invoke, function(err){
                                if (err){
                                    resultTest.success = false;
                                    callBack(err, resultTest);
                                }
                                else{
                                    callBack(null, resultTest);
                                }
                            }, context);
                        }
                        catch(errAfter){
                            resultTest.success = false;
                            callBack(errAfter, resultTest);
                        }
                    }
                    else{
                        callBack(null, resultTest);
                    }
                }
            })
        }
    }

    if (this.before){
        try{
            this.before(invoke, function(err){
                if (err){
                    resultTest.success = false;
                    callBack(err);
                }
                else{
                    runAll();
                }
            }, context);
        }
        catch(errBefore){
            resultTest.success = false;
            callBack(errBefore);
        }
    }
    else{
        runAll();
    }
}