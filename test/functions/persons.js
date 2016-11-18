"use strict";

module.name = "person.list";
module.version = "v1";
module.category = "test";
module.summary = "list persons"
module.description = "list persons";

module.input = {
    name:{type:"string", required:true}
};
module.output = {
    list:{type:"array", required:true, items: {
        code:{type:"integer", required:true},
        name:{type:"string", required:true},
        date:{type:"date", required:true},
        listChildren:{type:"array", required:true, items: {
            code:{type:"integer", required:true},
            name:{type:"string", required:true}        
        }}
    }}
};

module.exports = function(context, message, callBack){
    var persons = [];
    var person1 = {}, person2 = {}, person3 = {};

    person1.code = 1;
    person1.name = "person 1";
    person1.date = new Date();
    person1.listChildren = [{code: 1, name: "child 1"}, {code: 2, name: "child 2"}]

    person2.code = 2;
    person2.name = "person 2";
    person2.date = new Date();
    person2.listChildren = [{code: 1, name: "child 1"}, {code: 2, name: "child 2"}]

    person3.code = 3;
    person3.name = "person 3";
    person3.date = new Date();
    person3.listChildren = [{code: 1, name: "child 1"}, {code: 2, name: "child 2"}]
    
    persons.push(person1);
    persons.push(person2);
    persons.push(person3);

    callBack(null, persons);
};