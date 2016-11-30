
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
        factory.invoke(functionTest.stage, functionTest.name, functionTest.version, dataInvoke, null, callBackInvoke);
    }

    for (var i = 0; i < qtdTest; i++){
        (function(key, item){
            var diffTime = 0;
            var start = process.hrtime();
            
            item(invoke, function(err){
                var result = {};
                diffTime = (process.hrtime(start)[1] / 1000);

                if (err){
                    result.success = false;
                    result.error = err.message;
                    resultTest.success = false;
                }
                else{
                    result.success = true;
                }
                result.description = key;
                result.time = diffTime;
                
                resultTest.listResult.push(result);
                if (resultTest.listResult.length === qtdTest){
                    callBack(null, resultTest);
                }
            });
        })(keys[i], this.test[keys[i]]);
    }
}