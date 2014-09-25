var sysPath = require('path'),
	browserSync = require("browser-sync"),
	extend = require("extend"),
	injectFileTypes = [ '.css', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp' ],
	isInjectable = function(file) {
		return injectFileTypes.indexOf(sysPath.extname(file)) > -1;
	};

// register the snippet plugin
browserSync.use({
	"plugin:name": 'Snippet Injector',
	plugin: function(bs, opts) {}
});

function BrowserSync(config) {
	var self = this;
	if(config == null) config = {};
	var bsConfig = {
		logSnippet: false
	};
	var plugins = config.plugins || {};
	var cfg = plugins.browserSync || {};
	if(config.persistent) {
		self.enabled = (cfg.enabled == null) ? true : cfg.enabled;
	}
	extend(bsConfig, cfg);

	var startServer = (function() {
		if(!browserSync.active) {
			browserSync(bsConfig, function(err, bs) {
				self.server = bs;
				injectFileTypes = (bs.options.injectFileTypes || injectFileTypes).map(function(ext) {
					return '.'+ext;
				});
				if(self.onServerSnippet) {
					self.onServerSnippet(bs.options);
				}
				if(err) {
					console.error("browserSync " + err);
				}
			});
		}
	});

	if(self.enabled) startServer();
}

BrowserSync.prototype.brunchPlugin = true;
BrowserSync.prototype.type = 'javascript';
BrowserSync.prototype.extension = 'js';

// after each compilation
BrowserSync.prototype.onCompile = function(changedFiles) {
	var enabled = this.enabled;
	if(!enabled) return;

	var didCompile = changedFiles.length > 0;
	var files = changedFiles.map(function(obj) {
		return obj.path;
	});
	var injectable = didCompile && files.every(isInjectable);

	if(toString.call(enabled) === '[object Object]') {
		if(!(didCompile || enabled.assets)) return;
		var changedExts = files.map(function(f) {
			return sysPath.extname(f).slice(1);
		});
		var wasChanged = !Object.keys(enabled).some(function(_) {
			return enabled[_] && changedExts.indexOf(_) !== -1;
		});
		if(wasChanged) return;
	}

	var reload = function() {
		if(injectable) {
			browserSync.reload(files);
		} else {
			browserSync.reload();
		}
	};

	reload();
};

// file to include
//var incPath = sysPath.join(__dirname, 'vendor', 'browser-sync.js');

//var incPath = sysPath.join(__dirname, '..', 'node_modules', 'browser-sync-client', 'dist', 'browser-sync-client.js');
//var incPath = sysPath.join(__dirname, 'vendor', 'browser-sync-client.js');
var incPath = sysPath.join(__dirname, 'vendor', 'browser-sync-injector.js');
BrowserSync.prototype.include = function() {
	return this.enabled ? [incPath] : [];
};

// stop the server on brunch stop
BrowserSync.prototype.teardown = function() {
	if(browserSync.active) browserSync.exit();
};

BrowserSync.prototype.compile = function(params, callback) {
	if(this.enabled && sysPath.basename(params.path) === 'browser-sync-injector.js') {
		this.onServerSnippet = function(opt) {
			params.data = "document.write(\"<script async src='//HOST:"+opt.port+"/browser-sync/browser-sync-client."+this.server.version+".js'><\/script>\".replace(/HOST/g, location.hostname));";
			callback(null, params);
		}.bind(this);
		if(this.server) {
			this.onServerSnippet(this.server.options);
		}
	} else {
		return callback(null, params);
	}
};

module.exports = BrowserSync;
