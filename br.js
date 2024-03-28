var livereload = require('livereload');
var lrport = process.env.TOBF_LIVERELOAD_PORT || 35729;
var server = livereload.createServer({ port: lrport, exts: ["html", "js"] }, () => {
	console.log(`LiveReload server started, list on port ${lrport}`);
});

var towatch =__dirname + "/public" 
console.log(towatch)
server.watch(towatch);
