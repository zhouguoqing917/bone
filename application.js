var Application = Bone.Application = function (options) {
    this.options = _.extend({}, _.result(this, 'options'), options);
    this.mergeOptions(options, ['region', 'regionClass']);
    if (this._initRegion) this._initRegion();
    if (this._initRadio) this._initRadio();
    this.initialize.apply(this, arguments);
};

Bone.Application.extend = Bone.extend;

_.extend(Bone.Application.prototype, Bone.CommonMixin, Bone.RadioMixin, Bone.Events, {
    cidPrefix: 'app',
    initialize: function () {  },
    regionClass: Bone.Region,
    _initRegion: function(options) {
        var region = this.region;
        var RegionClass = this.regionClass;
        if (_.isString(region)) {
            this._region = new RegionClass({
                el: region
            });
            return;
        }
        this._region = region;
    },
    getRegion: function getRegion() {
        return this._region;
    },
    showView: function(view) {
        var region = this.getRegion();
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }
        return region.show.apply(region, [view].concat(args));
    },
    getView: function() {
        return this.getRegion().currentView;
    },
    // kick off all of the application's processes.
    start: function(options) {
        this.triggerMethod('before:start', this, options);
        this.triggerMethod('start', this, options);
        return this;
    },
    _isDestroyed: false,
    isDestroyed: function isDestroyed() {
        return this._isDestroyed;
    },
    destroy: function () {
        if (this._isDestroyed) {
            return this;
        }
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }
        this.triggerMethod.apply(this, ['before:destroy', this].concat(args));
        this._isDestroyed = true;
        this.triggerMethod.apply(this, ['destroy', this].concat(args));
        this.stopListening();
        return this;
    },
    triggerMethod: Bone.triggerMethod,
    triggerMethodOn: Bone.triggerMethodOn
});

//global export seajs
(function (root) {
     if (typeof define === 'function') {
        define("Bone",function (require, exports, module) {
            module.exports = Bone;
        });
    }

}(window));
