'use strict';

var path = require('path'),
    browserSync = require('browser-sync'),
    cluster = require('cluster'),
    extend = require('extend');

if (cluster.isWorker) {
    console.error('Workers are not supported yet, check the following brunch issue: https://github.com/brunch/brunch/issues/879');
}

function BrowserSync(config) {
    var cfg,
        self = this,
        bsConfig = {
            logSnippet: false
        };

    if (config && config.plugins && config.plugins.browserSync) {
        cfg = config.plugins.browserSync;
    } else {
        cfg = {};
    }
    if (config && config.persistent) {
        self.enabled = cfg.enabled ? cfg.enabled : true;
    }

    if (self.enabled && !browserSync.active) {
        extend(bsConfig, cfg);
        browserSync(bsConfig, function(err, bs) {
            if (err) {
                console.error("browserSync " + err);
            } else {
                self.server = bs;
                if (self.onServerSnippet) { // if compile before server launched
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
BrowserSync.prototype.onCompile = function onBrowserSyncCompile(changedFiles) {
    if (!this.enabled) {
        return;
    }

    var files = changedFiles.map(function(obj) {
        return obj.path;
    });

    // only reload for files enabled
    if ('[object Object]' === Object.prototype.toString.call(this.enabled)) {
        if (!(changedFiles.length > 0 || this.enabled.assets)) {
            return;
        }

        var changedExts = files.map(function(f) {
            return path.extname(f).slice(1);
        });
        var wasChanged = Object.keys(this.enabled).some(function(k) {
            return this.enabled[k] && changedExts.indexOf(k) !== -1;
        });
        if (!wasChanged) {
            return;
        }
    }

    // give files array when available
    browserSync.reload(files.length > 0 ? files : null);
};

// file to include
var incPath = path.join(__dirname, 'vendor', 'browser-sync-injector.js');
BrowserSync.prototype.include = function browserSyncInclude() {
    return this.enabled ? [incPath] : [];
};

// stop the server on brunch stop
BrowserSync.prototype.teardown = function browserSyncTeardown() {
    if (browserSync.active) {
        browserSync.exit();
    }
};

BrowserSync.prototype.compile = function browserSyncCompile(params, callback) {
    if (!this.enabled || 'browser-sync-injector.js' !== path.basename(params.path)) {
        return callback(null, params);
    }

    var self = this;
    this.onServerSnippet = function browserSyncOnServerSnippet() {
        var injectedJS = [
            '(function(/* BrowserSync-Brunch */) {',
            '  var url = "//" + location.hostname + ":PORT' +
                '/browser-sync/browser-sync-client.VERSION.js";',
            '  var bs = document.createElement("script");',
            '  bs.type = "text/javascript"; bs.async = true; bs.src = url;',
            '  var s = document.getElementsByTagName("script")[0];',
            '  s.parentNode.insertBefore(bs, s);',
            '})();'
        ]
        .join("\n")
        .replace(/PORT/g, self.server.options.getIn(['port']))
        .replace(/VERSION/g, self.server.options.getIn(['version']));

        params.data = injectedJS;
        callback(null, params);
    };

    if (this.server) { // if server launched before compile
        this.onServerSnippet();
    }
};

module.exports = BrowserSync;
