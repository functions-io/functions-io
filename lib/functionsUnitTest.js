
module.exports = function(context, message, callBack){
    var keys;
    var qtdTest;
    var factory = this._factory;
    var resultTest = {};
    
    resultTest.success = true;
    resultTest.listResult = [];

    keys = Object.keys(this.test);
    qtdTest = keys.length;

    for (var i = 0; i < qtdTest; i++){
        (function(key, item){
            var diffTime = 0;
            var start = process.hrtime();
            
            item(factory, function(err){
                var result = {};
                diffTime = (process.hrtime(start)[1] / 1000);

                if (err){
                    result.success = false;
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