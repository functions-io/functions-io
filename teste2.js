var chokidar = require('chokidar');

chokidar.watch('/tmp/tmp2', {ignored: /[\/\\]\./}).on('all', function(event, path){
  console.log(event, path);
});