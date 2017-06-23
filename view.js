(function () {
// Bone.View
// -------------

// Cached regex to split keys for `delegate`.
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;
 
    var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className',
        'tagName', 'events','_events', 'regions', 'Region', 'template', 'ui'];

    var View = Bone.View = function (options) {
        this.cid = _.uniqueId('view');
        this.preinitialize.apply(this, arguments);
        // Pick out a few initializing options
        _.extend(this, _.pick(options || {}, viewOptions)); 
        // Initialize our regions object
        this.events   =  _.extend({}, _.result(this, 'events'), _.result(this, '_events') ); 
        this.options  = _.extend({}, _.result(this, 'options'), options);
        this._regions = {};
        this._ensureElement();
        this.render = _.bind(this.render, this);
        this.initialize.apply(this, arguments); 
        this.events  =  _.extend({}, _.result(this, 'events'), _.result(this, '_events') ); //合并
        this.addRegions(_.result(this, 'regions'));
        // Have the view listenTo the model and collection.
       this.model && this._listenToEvents(this.model, _.result(this, 'modelEvents'));
       this.collection && this._listenToEvents(this.collection, _.result(this, 'collectionEvents'));
        _.bindAll(this, '_viewHelper'); 

    };

    View.extend = Bone.extend;

// Set up all inheritable **Bone.View** properties and methods.
    _.extend(View.prototype, Bone.CommonMixin, Bone.RadioMixin, Bone.Events, {

        // The default `tagName` of a View's element is `"div"`.
        tagName: 'div',

        // jQuery delegate for element lookup, scoped to DOM elements within the
        // current view. This should be preferred to global lookups where possible.
        $: function (selector) {
            return this.$el.find(selector);
        },
        preinitialize: function(){},
        // Initialize is an empty function by default. Override it with your own
        // initialization logic.
        initialize: function () {
        },
        // A useful default render method.
        render: function () {
            this._isRendering = true;
            this.triggerMethod('render', this);
            // Detach all our regions, so they don't need to be re-rendered.
            _.invoke(this._regions, 'detach');
            this._renderTemplate();
            // Reattach all our regions
            _.invoke(this._regions, 'reattach');
            this._isRendering = false;
            this._isRendered = true;
            //trigger the "render" event and call the "onRender" method.
            this.triggerMethod('rendered', this);
            return this;

        },
        // A useful remove method that triggers events.
        remove: function () {
            this.triggerMethod('remove', this);
            this._removeFromParent();
            _.invoke(this._regions, 'remove');
            this._removeElement();
            this.stopListening();
            this.triggerMethod('removed', this);
            return this;
        },
        // Remove this view's element from the document and all event listeners
        // attached to it. Exposed for subclasses using an alternative DOM
        // manipulation API.
        _removeElement: function () {
            this.$el.remove();
        },

        // Change the view's element (`this.el` property) and re-delegate the
        // view's events on the new element.
        setElement: function (element) {
            this.undelegateEvents();
            this._setElement(element);
            this.delegateEvents();
            return this;
        },

        // Creates the `this.el` and `this.$el` references for this view using the
        // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
        // context or an element. Subclasses can override this to utilize an
        // alternative DOM manipulation API and are only required to set the
        // `this.el` property.
        _setElement: function (el) {
            this.$el = el instanceof Bone.$ ? el : Bone.$(el);
            this.el = this.$el[0];
        },

        // Set callbacks, where `this.events` is a hash of
        //
        // *{"event selector": "callback"}*
        //
        //     {
        //       'mousedown .title':  'edit',
        //       'click .button':     'save',
        //       'click .open':       function(e) { ... }
        //     }
        //
        // pairs. Callbacks will be bound to the view, with `this` set properly.
        // Uses event delegation for efficiency.
        // Omitting the selector binds the event to `this.el`.
        delegateEvents: function (events) {
            events  = events || _.extend({}, _.result(this, 'events'), _.result(this, '_events')); 
            console.log('delegateEvents',events);
            if (!events) return this;
            this.undelegateEvents();
            for (var key in events) {
                var method = events[key];
                if (!_.isFunction(method)) method = this[method];
                if (!method) continue;
                var match = key.match(delegateEventSplitter);
                match && this.delegate(match[1], match[2], _.bind(method, this));
            }
            return this;
        },

        // Add a single event listener to the view's element (or a child element
        // using `selector`). This only works for delegate-able events: not `focus`,
        // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
        delegate: function (eventName, selector, listener) {
            this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
            return this;
        },

        // Clears all callbacks previously bound to the view by `delegateEvents`.
        // You usually don't need to use this, but may wish to if you have multiple
        // Bone views attached to the same DOM element.
        undelegateEvents: function () {
            if (this.$el) this.$el.off('.delegateEvents' + this.cid);
            return this;
        },

        // A finer-grained `undelegateEvents` for removing a single delegated event.
        // `selector` and `listener` are both optional.
        undelegate: function (eventName, selector, listener) {
            this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
            return this;
        },

        // Produces a DOM element to be assigned to your view. Exposed for
        // subclasses using an alternative DOM manipulation API.
        _createElement: function (tagName) {
            return document.createElement(tagName);
        },

        // Ensure that the View has a DOM element to render into.
        // If `this.el` is a string, pass it through `$()`, take the first
        // matching element, and re-assign it to `el`. Otherwise, create
        // an element from the `id`, `className` and `tagName` properties.
        _ensureElement: function () {
            if (!this.el) {
                var attrs = _.extend({}, _.result(this, 'attributes'));
                if (this.id) attrs.id = _.result(this, 'id');
                if (this.className) attrs['class'] = _.result(this, 'className');
                this.setElement(this._createElement(_.result(this, 'tagName')));
                this._setAttributes(attrs);
            } else {
                this.setElement(_.result(this, 'el'));
            }
        },

        // Set attributes from a hash on this view's element.  Exposed for
        // subclasses using an alternative DOM manipulation API.
        _setAttributes: function (attributes) {
            this.$el.attr(attributes);
        },
        isDestroyed: false,
        _isShown: false,
        _isRendered: false,
        Region: Bone.Region,
        getTemplate: function () {
            return this.getOption('template');
        },
        serializeModel: function (model) {
            return model.toJSON.apply(model, _.rest(arguments));
        },
        serializeCollection: function (collection) {
            return collection.toJSON.apply(collection, _.rest(arguments));
        },
        serialize: function () {
            if (!this.model && !this.collection) {
                return {};
            }
            var args = [this.model || this.collection];
            if (arguments.length) {
                args.push.apply(args, arguments);
            }
            if (this.model) {
                return this.serializeModel.apply(this, args);
            } else {
                return {
                    items: this.serializeCollection.apply(this, args)
                };
            }
        },
        _serialize: function () {
            return _.extend({view: this._viewHelper}, this.serialize());
        },


        _renderTemplate: function _renderTemplate() {
            var template = this.getTemplate();
            var data = this.serialize();
            data = this.mixinTemplateHelpers(data);
            this.triggerMethod('renderTemplate');
            var html = Bone.Renderer.render(template, data, this);
            this.attachElContent(html);
            this._addUIElements();
            this.triggerMethod('renderTemplateed');
        },
        mixinTemplateHelpers: function (target) {
            target = target || {};
            var templateHelpers = this.getOption['templateHelpers'];
            templateHelpers = Bone._getValue(templateHelpers, this);
            return _.extend(target, templateHelpers);
        },
        attachElContent: function (html) {
            this.$el.html(html);
            return this;
        },
        addRegion: function (name, view) {
            // Remove the old region, if it exists already
            _.result(this._regions[name], 'remove');

            var options = {cid: name};
            // If this is a Bone.View, pass that as the
            // view to the region.
            if (!view || view.$el) {
                options.view = view;
            } else {
                // If view is a selector, find the DOM element
                // that matches it.
                options.selector = _.result(view, 'selector') || view;
                options.el = this.$(view);
            }
            var region = new this.Region(options);
            region._parent = this;
            this[region.cid] = this._regions[region.cid] = region;

            return region;
        },

        // Adds multiple regions to the view. Takes
        // an object with {regioneName: view} syntax
        addRegions: function (regions) {
            _.each(regions, function (view, name) {
                this.addRegion(name, view);
            }, this);
            return this;
        },
        destroy: function () {
            if (this.isDestroyed) {
                return this;
            }
            var args = _.toArray(arguments);
            this.triggerMethod.apply(this, ['before:destroy'].concat(args));
            this.isDestroyed = true;
            this.triggerMethod.apply(this, ['destroy'].concat(args));
            this.remove();
            return this;
        },
        // A remove helper to remove this view from it's parent
        _removeFromParent: function () {
            // Remove this view from _parent, if it exists
            attempt(this._parent, '_removeView', this);
        },

        _removeRegion: function (region) {
            delete this[region.cid];
            delete this._regions[region.cid];
        },

        _listenToEvents: function (entity, events) {
            if (!entity) {
                return;
            }
            _.each(events, function (method, event) {
                if (!_.isFunction(method)) {
                    method = this[method];
                }
                this.listenTo(entity, event, method);
            }, this);
        },

        _addUIElements: function () {
            _.each(_.result(this, 'ui'), function (selector, name) {
                this['$' + name] = this.$(selector);
            }, this);
        },
        _viewHelper: function (name) {
            var region = this._regions[name] || this.addRegion(name);
            var el = region.view.el;
            if (el) {
                return el.outerHTML;
            }
            return '';
        },
        getOption: Bone.proxyGetOption,
        // Import the `triggerMethod` to trigger events with corresponding
        // methods if the method exists
        triggerMethod: Bone.triggerMethod,
        // A handy way to merge options onto the instance
        mergeOptions: Bone.mergeOptions,
        normalizeMethods: Bone.normalizeMethods,
        setOptions: Bone.setOptions,
        bindEvents: Bone.bindEvents,
        unbindEvents: Bone.unbindEvents
    });
    
}(this));