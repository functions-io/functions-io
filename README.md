# Functions-IO
## Functional Micro Framework
## work in progress...
Minimalist functional framework for [node](http://nodejs.org).

```javascript
var functionsjs = require("functions-io");
var server = functionsjs.createServer();

server.factory.scan(function(err){
    if (err){
        console.error(err);
    }
    else{
        server.listen(8080);
    }
});

```

## Installation
```bash
$ npm install functions-io
```

## Features
  * Focus on high performance
  * Auto reload change in javascript files
  * Input/Output interface