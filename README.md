# Functions-IO
## Functional Micro Framework
## work in progress...
Minimalist functional framework for [node](http://nodejs.org).

## Features
  * Focus on high performance
  * Auto reload change in javascript files
  * Input/Output with automatic validation
  * Unit Test with automatic execution
  * Openapi/Swagger definition generated automatically
  * Statistics - access, error, abort, time

## Installation
```bash
$ npm install functions-io
```

## Usage
### Create a function in folder functions
```javascript
module.version = "v1";
module.category = "test";
module.summary = "sum";
module.description = "sum x + y";

module.input = {
    x:{type:"integer", required:true},
    y:{type:"integer", required:true}
};
module.output = {
    value:{type:"integer"}
};

module.exports = function(context, message, callBack){
    callBack(null, {value: message.x + message.y});
};
```
### Start Server
```javascript
var functionsio = require("functions-io");
var app = functionsio();

app.listen(8080);
```

## swagger.json
```
http://localhost:8080/swagger.json
```
## Catalog API (Openapi / Swagger)
```
http://localhost:8081/catalog
```
## Admin
```
http://localhost:8081/stats
```
## Unit Test
```
http://localhost:8081/test
```

## Options property
* path (default: functions)
* enableStatistics (default: true)
* enableSecurity (default: false)
* unitTest
* * load (default: true)
* * executeOnStart (default: false)
* scan
* * automatic (default: true)
* * interval (default: 2000)
* cors
* * enable (default: true)
* * fromOrigin (default: *)
* html
* * enable (default: true)
* * port (default: 8081)
* db
* * provider (default: sys.db.provider.mongo)
* functions
* * sys.db.provider.mongo
* * * db
* * * * url (default: mongodb://localhost:27017/sample)

```javascript
//example
var functionsio = require("functions-io");
var app = functionsio();

app.listen(8080);
```
* example file config.json
```json
{
    "functions":{
        "sys.db.provider.mongo":{
            "db":{
                "url":"mongodb://localhost:27017/sample"
            }
        }
    }
}
```

* example file config.json
```json
{
    "unitTest":{
        "load": true,
        "executeOnStart": false
    },
    "functions":{
        "sys.db.provider.mongo":{
            "db":{
                "url":"mongodb://localhost:27017/sample"
            }
        }
    }
}
```

* example file config.json
```json
{
    "scan":{
        "automatic": true
    },
    "unitTest":{
        "load": true,
        "executeOnStart": false
    },
    "functions":{
        "sys.db.provider.mongo":{
            "db":{
                "url":"mongodb://localhost:27017/sample"
            }
        }
    }
}
```

* example file config.json
```json
{
    "scan":{
        "automatic": true
    },
    "unitTest":{
        "load": true,
        "executeOnStart": false
    },
    "global":{
        "db":{
            "provider":"sys.db.provider.myprovider"
        }
    }
}
```