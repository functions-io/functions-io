# Functions-IO
## Functional Micro Framework
## work in progress...
Minimalist functional framework for [node](http://nodejs.org).

```javascript
var functionsio = require("functions-io");
var app = functionsio();

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

## Options property
* isGenerateStatistics
* isDisableGenerateHTML
* enableCORS
* enableCORSFromOrigin
* path
* mountpath
```javascript
//example
var functionsio = require("functions-io");
var app = functionsio({path:"test/functions", enableCORS: true});

app.listen(8080);
```