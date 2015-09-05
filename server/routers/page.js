var fs = require('fs');
var path = require('path');
var url = require('url');

var Router = require('express').Router;
var Handlebars = require('handlebars');
var environment = require('../environment');

var model = {};

Handlebars.registerHelper('chunk', function(context, options) {
	if (Handlebars.Utils.isFunction(context)) {
		context = context.call(this);
	}

	context = context.slice(0);
	var size = options.hash.size || context.length,
		fn = options.fn,
		result = '';

	while (context.length) {
		result += fn(context.splice(0, size));
	}

	return result;
});


function walkDirectorySync(filepath, callback) {
	var stats = fs.statSync(filepath);
	var basename = path.basename(filepath);

	// Skip files and directories that start with .
	if (stats && basename[0] !== '.') {
		if (stats.isFile()) {
			callback(filepath);
		} else if (stats.isDirectory()) {
			fs.readdirSync(filepath).forEach(function(file) {
				walkDirectorySync(path.join(filepath, file), callback);
			});
		}
	}
}


function getFileContents(filepath) {
	return fs.readFileSync(filepath).toString();
}


function loadModel(filepath) {
	var extension = path.extname(filepath);
	var basename = path.basename(filepath, extension);

	switch (extension) {
		case '.json':
			model[basename] = JSON.parse(getFileContents(filepath));
			break;

		case '.js':
			model[basename] = require(filepath);
			break;

		default:
			throw new Error('Unsupported model extension. ' + extension);
	}
}


function loadPartial(filepath) {
	var extension = path.extname(filepath);
	var basename = path.basename(filepath, extension);

	Handlebars.registerPartial(basename.substr(1), getFileContents(filepath));
}

function loadTemplate(filepath) {
	return Handlebars.compile(getFileContents(filepath));
}


function mustacheHandler(filepath) {
	var template = environment.isProduction()
			? loadTemplate(filepath)
			: function(model) {
				return loadTemplate(filepath)(model);
			};

	return function(req, res) {
		var output = template(model);

		// TODO error handling?
		// TODO output caching?

		res.send(output);
	};
}


module.exports = function(app) {
	var router = Router();
	var rootDirectory = app.get('root');
	var modelsDirectory = path.join(rootDirectory, 'models');
	var viewsDirectory = path.join(rootDirectory, 'views');

	// Walk file system looking for models
	walkDirectorySync(modelsDirectory, loadModel);

	// Walk the file system looking for views and create routes for them
	// walkDirectorySync(viewsDirectory, function(filepath) {
	// 	var extension = path.extname(filepath);
	// 	var basename = path.basename(filepath, extension);

	// 	// Files that start with _ are partials and should not have routes
	// 	if (basename[0] === '_') {
	// 		loadPartial(filepath);
	// 		return;
	// 		/* UNREACHABLE */
	// 	}

	// 	// If the basename is index then use it as the folder's route
	// 	if (basename === 'index') {
	// 		basename = '/';
	// 	}

	// 	var route = url.resolve(filepath.replace(viewsDirectory, '').replace(path.sep, '/'), basename);

	// 	switch (extension) {
	// 		case '.html':
	// 		case '.mustache':
	// 			router.all(route, mustacheHandler(filepath));
	// 			break;

	// 		default:
	// 			// Unregistered extension, don't register route
	// 			return;
	// 			/* UNREACHABLE */
	// 	}

	// 	console.log('Registering route [' + route + ']');
	// });

	router.all('*', function(req, res) {
		// TODO 404 page
		res.send('Oops! Wah wah, no page found. Redirecting to something more slightly useful <meta http-equiv="refresh" content="3;url=/">');
	});

	// Set route
	app.use(router);

	return router;
};