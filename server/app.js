var fs = require('fs');
var path = require('path');
var express = require('express');

var app = express();
var routers = [ 'api', 'recall', 'page' ];



app.set('port', process.env.PORT || 3000);
// app.set('root', process.env.ROOT_DIR || process.cwd());
app.set('x-powered-by', false);


// Static asset routes under /* (js, css, img, etc)
app.use(express.static(app.get('root') + '/build', {
	dotfiles: 'deny',
	index: false
}));


routers.forEach(function(router) {
	require('./routers/' + router)(app);
});


app.listen(app.get('port'), function() {
	console.log('Listening on port ' + app.get('port'));
});