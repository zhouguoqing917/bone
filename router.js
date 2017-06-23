(function () {
// Bone.Router
// ---------------

// Routers map faux-URLs to actions, and fire events when routes are
// matched. Creating a new one sets its `routes` hash, if not set statically.
    var Router = Bone.Router = function (options) {
        options || (options = {});
        this.options = options || {};
        this.mergeOptions(options, ['appRoutes', 'controller']);
        if (options.routes) this.routes = options.routes;

        this._bindRoutes();
        this.initialize.apply(this, arguments);
        var appRoutes = this.getOption('appRoutes');
        var controller = this._getController();
        this.processAppRoutes(controller, appRoutes);
        this.on('route', this.routeToControllerAction, this);

    };
    Router.extend = Bone.extend;

// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
    var optionalParam = /\((.*?)\)/g;
    var namedParam = /(\(\?)?:\w+/g;
    var splatParam = /\*\w+/g;
    var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

// Set up all inheritable **Bone.Router** properties and methods.
    _.extend(Router.prototype, Bone.Events, Bone.CommonMixin, {

        // Initialize is an empty function by default. Override it with your own
        // initialization logic.
        initialize: function () {
        },

        // Manually bind a single named route to a callback. For example:
        //
        //     this.route('search/:query/p:num', 'search', function(query, num) {
        //       ...
        //     });
        //
        route: function (route, name, callback) {
            if (!_.isRegExp(route)) route = this._routeToRegExp(route);
            if (_.isFunction(name)) {
                callback = name;
                name = '';
            }
            if (!callback) callback = this[name];
            var router = this;
            Bone.history.route(route, function (fragment) {
                var args = router._extractParameters(route, fragment);
                if (router.execute(callback, args, name) !== false) {
                    router.trigger.apply(router, ['route:' + name].concat(args));
                    router.trigger('route', name, args);
                    Bone.history.trigger('route', router, name, args);
                }
            });
            return this;
        },

        // Execute a route handler with the provided parameters.  This is an
        // excellent place to do pre-route setup or post-route cleanup.
        execute: function (callback, args, name) {
            if (callback) callback.apply(this, args);
        },

        // Simple proxy to `Bone.history` to save a fragment into the history.
        navigate: function (fragment, options) {
            Bone.history.navigate(fragment, options);
            return this;
        },

        // Bind all defined routes to `Bone.history`. We have to reverse the
        // order of the routes here to support behavior where the most general
        // routes can be defined at the bottom of the route map.
        _bindRoutes: function () {
            if (!this.routes) return;
            this.routes = _.result(this, 'routes');
            var route, routes = _.keys(this.routes);
            while ((route = routes.pop()) != null) {
                this.route(route, this.routes[route]);
            }
        },

        // Convert a route string into a regular expression, suitable for matching
        // against the current location hash.
        _routeToRegExp: function (route) {
            route = route.replace(escapeRegExp, '\\$&')
                .replace(optionalParam, '(?:$1)?')
                .replace(namedParam, function (match, optional) {
                    return optional ? match : '([^/?]+)';
                })
                .replace(splatParam, '([^?]*?)');
            return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
        },

        // Given a route, and a URL fragment that it matches, return the array of
        // extracted decoded parameters. Empty or unmatched parameters will be
        // treated as `null` to normalize cross-browser behavior.
        _extractParameters: function (route, fragment) {
            var params = route.exec(fragment).slice(1);
            return _.map(params, function (param, i) {
                // Don't decode the search params.
                if (i === params.length - 1) return param || null;
                return param ? decodeURIComponent(param) : null;
            });
        },

        appRoute: function (route, methodName) {
            var controller = this._getController();
            this._addAppRoute(controller, route, methodName);
            return this;
        },

        routeToControllerAction: function (routeName, args) {
            var _this = this;
            if (_.isFunction(this.onRoute)) {
                // find the path that matches the current route
                var routePath = _.invert(this.getOption('appRoutes'))[routeName];
                this.onRoute(routeName, routePath, routeArgs);
            } else {
                routeName.replace(/^(\w+)\/(\w+)$/, function (_match, controller, action) {
                    attempt(_this[controller], action, args);
                });
            }
        },
        processAppRoutes: function (controller, appRoutes) {
            if (!appRoutes) {
                return;
            }
            var routeNames = _.keys(appRoutes).reverse(); // Bone requires reverted order of routes

            _.each(routeNames, function (route) {
                this._addAppRoute(controller, route, appRoutes[route]);
            }, this);
            return this;
        },
        _getController: function () {
            return this.getOption('controller');
        },
        _addAppRoute: function (controller, route, methodName) {
            var method = controller[methodName];
            if (!method) {
                throw new Error('Method "' + methodName + '" was not found on the controller');
            }
            this.route(route, methodName, _.bind(method, controller));
        },
        triggerMethod: Bone.triggerMethod
    });

}(this));