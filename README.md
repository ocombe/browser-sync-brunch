browser-sync-brunch
===================
Adds automatic browser reloading support to
[brunch](http://brunch.io) when using the `brunch watch` command.

The plugin uses [BrowserSync](http://browsersync.io/) technology to keep multiple browsers & devices in sync when building websites.

##Features from BrowserSync
1. **Scroll** - I can keep your pages in sync when scrolling.
2. **Forms** - You fill out a form in one browser, I'll copy the data to all the others.
3. **Links** - I'll watch your clicks and make all the other browsers follow you.
4. **CSS injecting** - I can even watch your CSS files & inject them when they change.
5. **Live Reload** - I can also watch files like HTML and PHP & when they change I can reload all browsers for you.
6. **Built-in Server** - Yep, I can serve static files too if you need me to (uses Connect).
7. **Use with any back-end setup** - I even have a proxy option so that I can be used with existing PHP, Rails, Python, Node or ASP.net setup.
8. **Public URL** - View your website via a URL that any internet connected device can access & maintain all BrowserSync features.
9. **Browser Stack support** - Use the all of my features when viewing your site through Browser Stack.

## Installation
Make sure that you have removed [auto-reload brunch](https://github.com/brunch/auto-reload-brunch) from your package.json if you were using it.

Install the plugin via npm with `npm install --save browser-sync-brunch`.

Or, do manual install:

* Add `"browser-sync-brunch": "x.y.z"` to `package.json` of your brunch app.
* If you want to use git version of plugin, add
`"browser-sync-brunch": "git+ssh://git@github.com:ocombe/browser-sync-brunch.git"`.

## Usage
In most cases, browser-sync-brunch works out of the box without any further
configuration. Stylesheet and image changes will be applied seamlessly, and any other
changes will trigger a page refresh.

### Brunch plugin settings
If customization is needed or desired, settings can be modified in your brunch config file (such as `brunch-config.coffee`).
You can use any BrowserSync option, refer to [their documentation](http://www.browsersync.io/docs/options/) for the complete list.

**Example:**
```js
exports.config: {
  ...
  plugins: {
      browserSync: {
          port: 3333,
          logLevel: "debug"
      }
  }
}
```

**Be careful, this plugin won't work with Brunch workers enabled because of [an error in Brunch source code](https://github.com/brunch/brunch/issues/879).***
