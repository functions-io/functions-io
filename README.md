# Functions-IO
## FaaS Micro Framework
## work in progress...
Minimalist FaaS framework for [node](http://nodejs.org).

## Features
  * Focus on high performance
  * Input/Output with automatic validation
  * Openapi/Swagger definition generated automatically
  * Statistics - access, error, abort, time

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

* custom login
```js
"use strict";

module.category = "sys";
module.name = "sys.security.provider.login.sample";
module.summary = "login provider";
module.validatePermission = false;
module.isPrivate = true;
module.errorName = "security.login";

module.exports = function(context, message, callBack){
    if (message.userName === "admin" && message.password === "admin"){
        var user = {};
        user.name = "admin";
        user.sub = "admin@admin.com";

        callBack(null, user);
    }
    else{
        callBack({code:1, message:"Invalid username or password"})
    }
};
```

curl -XPOST http://localhost:8080/oauth2/token -H "content-type:application/json" -d '{"grant_type":"password","username": "admin","password": "admin","audience": "https://someapi.com/api", "scope": "read:sample", "client_id": "YOUR_CLIENT_ID", "client_secret": "YOUR_CLIENT_SECRET"}' -v

curl -XPOST http://localhost:8080/oauth2/token -H "content-type:application/json" -d '{"grant_type":"password","username": "admin","password": "admin", "scope": "read:sample"}' -v

curl -XPOST http://localhost:8080 -H "content-type:application/json" -d '{"jsonrpc":"2.0","scope":"functions-io-labs","method":"math.sum","version":"2.0.0","params": [2,4]}' -v

