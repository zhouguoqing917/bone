(function () {
// Trigger Method
// --------------
    Bone._triggerMethod = (function () {
        var splitter = /(^|:)(\w)/gi;

        function getEventName(match, prefix, eventName) {
            return eventName.toUpperCase();
        }

        return function (context, event, args) {
            var noEventArg = arguments.length < 3;
            if (noEventArg) {
                args = event;
                event = args[0];
            }
            var methodName = 'on' + event.replace(splitter, getEventName);
            var method = context[methodName];
            var result;
            // call the onMethodName if it exists
            if (_.isFunction(method)) {
                // pass all args, except the event name
                result = method.apply(context, noEventArg ? _.rest(args) : args);
            }

            // trigger the event, if a trigger method exists
            if (_.isFunction(context.trigger)) {
                if (noEventArg + args.length > 1) {
                    context.trigger.apply(context, noEventArg ? args : [event].concat(_.drop(args, 0)));
                } else {
                    context.trigger(event);
                }
            }

            return result;
        };
    })();

// Trigger an event and/or a corresponding method name. Examples:
//
// `this.triggerMethod("foo")` will trigger the "foo" event and
// call the "onFoo" method.
//
// `this.triggerMethod("foo:bar")` will trigger the "foo:bar" event and
// call the "onFooBar" method.
    Bone.triggerMethod = function (event) {
        return Bone._triggerMethod(this, arguments);
    };

// triggerMethodOn invokes triggerMethod on a specific context
//
// e.g. `Bone.triggerMethodOn(view, 'show')`
// will trigger a "show" event or invoke onShow the view.
    Bone.triggerMethodOn = function (context) {
        var fnc = _.isFunction(context.triggerMethod) ?
            context.triggerMethod :
            Bone.triggerMethod;
        return fnc.apply(context, _.rest(arguments));
    };

  
}(this));