"use strict";

var Monitor = function(factory){
    this.interval = 1000;
    this.factory = factory;

    var self = this;
    var idWaitScan = null;

    this.start = function(){
        console.log("Monitor factory start");

        idWaitScan = setInterval(function(){
            self.factory.scan(function(err, data){
                if (err === null){
                    if (err){
                        console.log(err);
                    }
                    else{
                        if (data > 0){
                            console.log(new Date() + " - " + data + " functions loaded");
                        }
                    }
                }
                else{
                    console.log(err);
                }
            });
        }, this.interval);
    };

    this.stop = function(){
        if (idWaitScan){
            clearInterval(idWaitScan);
            idWaitScan = null;
        }
    };
};

module.exports = Monitor;