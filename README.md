# Functions-IO
## FaaS Micro Framework
## work in progress...
Minimalist FaaS framework for [node](http://nodejs.org).

## Features
  * Focus on high performance
  * Input/Output with automatic validation
  * Openapi/Swagger definition generated automatically

## Installation
```bash
$ npm install functions-io
```

## Usage

### Create a subfolder in functions folder and generate package.json
```bash
$ npm init
```

### example package.json
```json
{
  "name": "sum",
  "version": "1.0.0",
  "description": "sum x + y",
  "main": "index.js"
}
```

### create file index.js

```javascript
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
http://localhost:8080/_admin/catalog
```
## Admin
```
http://localhost:8080/_admin/stats
```
## Test
```
http://localhost:8080/_admin/test
```

## Options property
* path (default: functions)
* enableStatistics (default: true)
* enableSecurity (default: false)
* test
* * load (default: true)
* * executeOnStart (default: false)
* scan
* * automatic (default: true)
* * interval (default: 2000)
* cors
* * enable (default: false)
* * fromOrigin (default: *)
* html
* * static (default: static)
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

curl -XPOST http://localhost:8080 -H "content-type:application/json" -d '{"jsonrpc":"2.0","method":"security.login","params": {"username":"admin", "password":"123"} }' -v

curl -XPOST http://localhost:8080 -H "content-type:application/json" -H "authorization:bearer " -d '{"jsonrpc":"2.0","scope":"functions-io-labs","method":"math.sum","version":"2.0.0","params": [2,4]}' -v