var fs = require('fs');
var path = require('path');
var express = require('express');

var app = express();
var routers = [ 'page' ];



app.set('port', process.env.PORT || 3000);
app.set('root', process.env.ROOT_DIR || path.resolve(__dirname, '..'));
app.set('x-powered-by', false);
console.log(app.get('root'));

// Static asset routes under /* (js, css, img, etc)
app.use(express.static(path.join(app.get('root'), 'build'), {
	dotfiles: 'deny',
	index: false
}));


routers.forEach(function(router) {
	require('./routers/' + router)(app);
});


app.listen(app.get('port'), function() {
	console.log('Listening on port ' + app.get('port'));
});