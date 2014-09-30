var sysPath = require('path'),
    browserSync = require("browser-sync"),
    extend = require("extend");

function BrowserSync(config) {
    var cfg,
        self = this,
        bsConfig = {
            logSnippet: false
        };

    if(config && config.plugins && config.plugins.browserSync) {
        cfg = config;
    } else {
        cfg = {};
    }
    self.enabled = cfg.enabled ? cfg.enabled : true;

    if(self.enabled && !browserSync.active) {
        extend(bsConfig, cfg);
        browserSync(bsConfig, function(err, bs) {
            if(err) {
                console.error("browserSync " + err);
            } else {
                self.server = bs;
                if(self.onServerSnippet) { // if compile before server launched
                    self.onServerSnippet();
                }
            }
        });
    }
}

BrowserSync.prototype.brunchPlugin = true;
BrowserSync.prototype.type = 'javascript';
BrowserSync.prototype.extension = 'js';

// after each compilation
BrowserSync.prototype.onCompile = function(changedFiles) {
    if(!this.enabled) {
        return;
    }

    var files = changedFiles.map(function(obj) {
        return obj.path;
    });

    // only reload for files enabled
    if('[object Object]' === toString.call(this.enabled)) {
        if(!(changedFiles.length > 0 || this.enabled.assets)) {
            return;
        }
        var changedExts = files.map(function(f) {
            return sysPath.extname(f).slice(1);
        });
        var wasChanged = !Object.keys(enabled).some(function(_) {
            return enabled[_] && changedExts.indexOf(_) !== -1;
        });
        if(wasChanged) {
            return;
        }
    }

    browserSync.reload(files);
};

// file to include
var incPath = sysPath.join(__dirname, 'vendor', 'browser-sync-injector.js');
BrowserSync.prototype.include = function() {
    return this.enabled ? [incPath] : [];
};

// stop the server on brunch stop
BrowserSync.prototype.teardown = function() {
    if(browserSync.active) {
        browserSync.exit();
    }
};

BrowserSync.prototype.compile = function(params, callback) {
    if(this.enabled && 'browser-sync-injector.js' === sysPath.basename(params.path)) {
        this.onServerSnippet = function() {
            params.data = "document.write(\"<script async src='//HOST:" + this.server.options.port + "/browser-sync/browser-sync-client." + this.server.version + ".js'><\/script>\".replace(/HOST/g, location.hostname));";
            callback(null, params);
        }.bind(this);

        if(this.server) { // if server launched before compile
            this.onServerSnippet();
        }
    } else {
        return callback(null, params);
    }
};

module.exports = BrowserSync;
