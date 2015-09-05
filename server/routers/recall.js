var url = require('url');
var Router = require('express').Router;

module.exports = function(app) {
	var router = Router();

	router.get('/preview-moment', function(req, res) {
		res.redirect(301, 'atlas://recall/preview-moment/' + url.parse(req.url).query);
	});

	app.use('/recall', router);

	return router;
};