var env = process.env.NODE_ENV,
	isExplicit = true;

switch(env) {
	default:
		isExplicit = false;
		/* FALL-THROUGH */

	case 'debug':
	case 'dev':
	case 'development':
		env = 'development';
		break;

	case 'release':
	case 'prod':
	case 'production':
		env = 'production';
		break;
}

module.exports = {
	isDevelopment: function() {
		return env === 'development';
	},

	isProduction: function() {
		return env === 'production';
	},

	isExplicit: function() {
		return isExplicit;
	}
};