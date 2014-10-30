var sysPath = require('path'),
    browserSync = require("browser-sync"),
    cluster = require('cluster'),
    extend = require("extend");

if(cluster.isWorker) {
    console.error('Workers are not supported yet, check the following brunch issue: https://github.com/brunch/brunch/issues/879');
}

function BrowserSync(config) {
    var cfg,
        self = this,
        bsConfig = {
            logSnippet: false
        };

    if(config && config.plugins && config.plugins.browserSync) {
        cfg = config.plugins.browserSync;
    } else {
        cfg = {};
    }
    if(config && config.persistent) {
        self.enabled = cfg.enabled ? cfg.enabled : true;
    }

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
    if('[object Object]' === Object.prototype.toString.call(this.enabled)) {
        if(!(changedFiles.length > 0 || this.enabled.assets)) {
            return;
        }
        var changedExts = files.map(function(f) {
            return sysPath.extname(f).slice(1);
        });
        var wasChanged = !Object.keys(this.enabled).some(function(_) {
            return this.enabled[_] && changedExts.indexOf(_) !== -1;
        });
        if(wasChanged) {
            return;
        }
    }

    // give files array when available
    browserSync.reload(files.length > 0 ? files : null);
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
