var assert = require("assert");
var InputValidate = require("../lib/InputValidate");
var inputValidate = new InputValidate();
var now = new Date();

var input1 = {
    code:{type:"integer", required:true},
    name:{type:"string", required:true},
    date:{type:"date", required:true},
    value:{type:"float", required:true},
    option:{type:"string", required:true, enum: ["Male", "Female"]}
};

var input2 = {
    code:{type:"integer", required:true},
    name:{type:"string", required:true},
    date:{type:"date", required:true},
    value:{type:"float", required:true},
    option:{type:"string", required:true, enum: ["Male", "Female"]},
    listArray1:{type:"array", required:true, items: {
        code:{type:"integer", required:true},
        name:{type:"string", required:true},
        date:{type:"date", required:true},
        value:{type:"float", required:true},
        option:{type:"string", required:true, enum: ["Male", "Female"]}
    }},
    listArray2:{type:"array", required:false, items: {
        code:{type:"integer", required:true},
        name:{type:"string", required:true},
        date:{type:"date", required:true},
        value:{type:"float", required:true},
        option:{type:"string", required:true, enum: ["Male", "Female"]}
    }},
    obj1:{type:"object", required:true, properties:{
        code:{type:"integer", required:true},
        name:{type:"string", required:true},
        date:{type:"date", required:true},
        value:{type:"float", required:true},
        option:{type:"string", required:true, enum: ["Male", "Female"]}
    }},
    obj2:{type:"object", required:false, properties:{
        code:{type:"integer", required:true},
        name:{type:"string", required:true},
        date:{type:"date", required:true},
        value:{type:"float", required:true},
        option:{type:"string", required:true, enum: ["Male", "Female"]}
    }}
};

var result = null;
var data1 = null, data2 = null;

//
//INPUT 1
//
data1 = {code: 1, name: "name 1", date:now, value:4.5, option:"Male"};
data2 = {code: "1", name: "name 1", date:now.toJSON(), value:"4.5", option:"Male"};

result = inputValidate.parse("function1", data1, input1);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.option, "Male");

result = inputValidate.parse("function1", data2, input1);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.value, 4.5);
assert.strictEqual(result.data.option, "Male");


//
//INPUT 2
//
data1.obj1 = {code: 1, name: "name 1", date:now, value:4.5, option:"Male"};
data1.listArray1 = [];
data1.listArray2 = [];
data1.listArray1.push({code: 1, name: "name 1", date:now, value:4.5, option:"Male"});
data1.listArray2.push({code: 1, name: "name 1", date:now, value:4.5, option:"Male"});

data2.obj1 = {code: 1, name: "name 1", date:now, value:4.5, option:"Male"};
data2.listArray1 = [];
data2.listArray2 = [];
data2.listArray1.push({code: "1", name: "name 1", date:now.toJSON(), value:"4.5", option:"Male"});
data2.listArray2.push({code: "1", name: "name 1", date:now.toJSON(), value:"4.5", option:"Male"});

result = inputValidate.parse("function1", data1, input2);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.option, "Male");
assert.strictEqual(result.data.obj1.code, 1);
assert.strictEqual(result.data.obj1.name, "name 1");
assert.strictEqual(result.data.obj1.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj1.option, "Male");
assert.strictEqual(result.data.listArray1[0].code, 1);
assert.strictEqual(result.data.listArray1[0].name, "name 1");
assert.strictEqual(result.data.listArray1[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[0].option, "Male");
assert.strictEqual(result.data.listArray2[0].code, 1);
assert.strictEqual(result.data.listArray2[0].name, "name 1");
assert.strictEqual(result.data.listArray2[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[0].option, "Male");


result = inputValidate.parse("function1", data2, input2);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.value, 4.5);
assert.strictEqual(result.data.option, "Male");
assert.strictEqual(result.data.obj1.code, 1);
assert.strictEqual(result.data.obj1.name, "name 1");
assert.strictEqual(result.data.obj1.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj1.option, "Male");
assert.strictEqual(result.data.listArray1[0].code, 1);
assert.strictEqual(result.data.listArray1[0].name, "name 1");
assert.strictEqual(result.data.listArray1[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[0].option, "Male");
assert.strictEqual(result.data.listArray2[0].code, 1);
assert.strictEqual(result.data.listArray2[0].name, "name 1");
assert.strictEqual(result.data.listArray2[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[0].option, "Male");


//
//INPUT 2 + ARRAY + OBJ
//
data1.obj2 = {code: 2, name: "name 2", date:now, value:5.9, option:"Female"};
data1.listArray1.push({code: 2, name: "name 2", date:now, value:5.9, option:"Female"});
data1.listArray2.push({code: 2, name: "name 2", date:now, value:5.9, option:"Female"});
data2.obj2 = {code: "2", name: "name 2", date:now.toJSON(), value:"5.9", option:"Female"};
data2.listArray1.push({code: "2", name: "name 2", date:now.toJSON(), value:"5.9", option:"Female"});
data2.listArray2.push({code: "2", name: "name 2", date:now.toJSON(), value:"5.9", option:"Female"});

result = inputValidate.parse("function1", data1, input2);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.option, "Male");
assert.strictEqual(result.data.obj1.code, 1);
assert.strictEqual(result.data.obj1.name, "name 1");
assert.strictEqual(result.data.obj1.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj1.option, "Male");
assert.strictEqual(result.data.obj2.code, 2);
assert.strictEqual(result.data.obj2.name, "name 2");
assert.strictEqual(result.data.obj2.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj2.option, "Female");
assert.strictEqual(result.data.listArray1[0].code, 1);
assert.strictEqual(result.data.listArray1[0].name, "name 1");
assert.strictEqual(result.data.listArray1[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[0].option, "Male");
assert.strictEqual(result.data.listArray1[1].code, 2);
assert.strictEqual(result.data.listArray1[1].name, "name 2");
assert.strictEqual(result.data.listArray1[1].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[1].option, "Female");
assert.strictEqual(result.data.listArray2[0].code, 1);
assert.strictEqual(result.data.listArray2[0].name, "name 1");
assert.strictEqual(result.data.listArray2[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[0].option, "Male");
assert.strictEqual(result.data.listArray2[1].code, 2);
assert.strictEqual(result.data.listArray2[1].name, "name 2");
assert.strictEqual(result.data.listArray2[1].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[1].option, "Female");


result = inputValidate.parse("function1", data2, input2);
assert.strictEqual(result.error, null);
assert.strictEqual(result.data.code, 1);
assert.strictEqual(result.data.name, "name 1");
assert.strictEqual(result.data.date.getTime(), now.getTime());
assert.strictEqual(result.data.value, 4.5);
assert.strictEqual(result.data.option, "Male");
assert.strictEqual(result.data.obj1.code, 1);
assert.strictEqual(result.data.obj1.name, "name 1");
assert.strictEqual(result.data.obj1.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj1.option, "Male");
assert.strictEqual(result.data.obj2.code, 2);
assert.strictEqual(result.data.obj2.name, "name 2");
assert.strictEqual(result.data.obj2.date.getTime(), now.getTime());
assert.strictEqual(result.data.obj2.option, "Female");
assert.strictEqual(result.data.listArray1[0].code, 1);
assert.strictEqual(result.data.listArray1[0].name, "name 1");
assert.strictEqual(result.data.listArray1[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[0].option, "Male");
assert.strictEqual(result.data.listArray1[1].code, 2);
assert.strictEqual(result.data.listArray1[1].name, "name 2");
assert.strictEqual(result.data.listArray1[1].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray1[1].option, "Female");
assert.strictEqual(result.data.listArray2[0].code, 1);
assert.strictEqual(result.data.listArray2[0].name, "name 1");
assert.strictEqual(result.data.listArray2[0].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[0].option, "Male");
assert.strictEqual(result.data.listArray2[1].code, 2);
assert.strictEqual(result.data.listArray2[1].name, "name 2");
assert.strictEqual(result.data.listArray2[1].date.getTime(), now.getTime());
assert.strictEqual(result.data.listArray2[1].option, "Female");

//console.log(result);

/*
assert.equal(functionManager.module.category, "test2");
assert.equal(functionManager.module.description, "sum x + y");
*/