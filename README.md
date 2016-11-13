# Functions-IO
## Functional Micro Framework
## work in progress...
Minimalist functional framework for [node](http://nodejs.org).

```javascript
var functionsio = require("functions-io");
var app = functionsio({path:"test/functions"});

app.listen(8080);
```

## Installation
```bash
$ npm install functions-io
```

## Features
  * Focus on high performance
  * Auto reload change in javascript files
  * Input/Output interface