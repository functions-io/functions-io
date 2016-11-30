
module.exports = function(context, message, callBack){
    var keys;
    var qtdTest;
    var factory = this._factory;
    var functionTest = this.functionTest;
    var resultTest = {};
    
    resultTest.success = true;
    resultTest.listResult = [];

    keys = Object.keys(this.test);
    qtdTest = keys.length;

    var invoke = function(dataInvoke, callBackInvoke){
        factory.invoke(functionTest.stage, functionTest.name, functionTest.version, dataInvoke, context, callBackInvoke);
    }

    for (var i = 0; i < qtdTest; i++){
        (function(key, item, before, after){
            var diffTime = 0;
            var start = process.hrtime();

            var callError = function(err){
                var result = {};
                diffTime = (process.hrtime(start)[1] / 1000);

                result.success = false;
                result.error = err.message;
                resultTest.success = false;
                result.description = key;
                result.time = diffTime;
                resultTest.listResult.push(result);
                if (resultTest.listResult.length === qtdTest){
                    callBack(err);
                }
            }

            var callSuccess = function(){
                var result = {};
                diffTime = (process.hrtime(start)[1] / 1000);

                result.success = true;

                result.description = key;
                result.time = diffTime;
                
                resultTest.listResult.push(result);
                if (resultTest.listResult.length === qtdTest){
                    callBack(null, resultTest);
                }
            }
            
            var callTest = function(){
                try{
                    item(invoke, function(err){
                        if (err){
                            callError(err);
                        }
                        else{
                            if (after){
                                try{
                                    after(invoke, function(err){
                                        if (err){
                                            callError(err);
                                        }
                                        else{
                                            callSuccess();
                                        }
                                    }, context);
                                }
                                catch(errAfter){
                                    callError(errAfter);
                                }                
                            }
                            else{
                                callSuccess();
                            }                            
                        }
                    }, context);
                                    
                }
                catch(errCallTest){
                    callError(errCallTest);
                }
            }

            if (before){
                try{
                    before(invoke, function(err){
                        if (err){
                            callError(err);
                        }
                        else{
                            callTest();
                        }
                    }, context);
                }
                catch(errBefore){
                    callError(errBefore);
                }                
            }
            else{
                callTest();
            }
        })(keys[i], this.test[keys[i]], this.before, this.after);
    }
}