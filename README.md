# Functions-IO
## Functional Micro Framework
## work in progress...
Minimalist functional framework for [node](http://nodejs.org).

## Features
  * Focus on high performance
  * Auto reload change in javascript files
  * Input/Output interface

## Installation
```bash
$ npm install functions-io
```

## Usage
```javascript
var functionsio = require("functions-io");
var app = functionsio();

app.listen(8080);
```

## Catalog API
```
http://localhost:8080/catalog
```
## Admin
```
http://localhost:8080/admin
```
## swagger.json
```
http://localhost:8080/swagger.json
```

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