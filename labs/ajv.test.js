//https://json-schema.org/understanding-json-schema/reference/array.html

const Ajv = require("ajv");

var ajv = new Ajv();

/*
var schema = {
    "properties": {
        "smaller": {"type": "number", "maximum": 5},
        "larger": {"type": "number"}
    }
};
*/

var schema = {
    type: "object",
    properties: {
        smaller: {type: "number", maximum: 5},
        larger: {type: "number"}
    }
};

var schema2 = {
    type: "array",
    items: {type: "number"}
};

var schema3 = {
    type: "array",
    items: [{type: "number"}, {type: "string"}, {type: "string", "enum": ["NW", "NE", "SW", "SE"]}],
    additionalItems: false
};
  
var validData = {
    smaller: 5,
    larger: 7
};

console.log(ajv.validate(schema, validData));
console.log(ajv.errors);

console.log(ajv.validate(schema2, [2,3]));
console.log(ajv.errors);

console.log(ajv.validate(schema3, [1,"2","NW",2]));
console.log(ajv.errors);