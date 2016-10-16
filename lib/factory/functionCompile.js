"use strict";

var vm = require("vm");

var wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

var FunctionCompile = function(){
    this.compile = function(filePATH, code){
        var codeWrapper = wrapper[0] + code + wrapper[1];
        var compiledWrapper = vm.runInThisContext(codeWrapper, {
            filename: filePATH,
            lineOffset: 1,
            displayErrors: true
        });

        var newModule = {};
        newModule.exports = {};

        compiledWrapper(newModule.exports, require, newModule, filePATH, filePATH);

        return newModule;
    };
};

module.exports = new FunctionCompile();