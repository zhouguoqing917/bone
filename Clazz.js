/**
 * 简单的命名空间及简单的模块化
 */
(function() {
    window.Bone = window.Bone || {};

    // 最基本的es5 class  polyfill
    if (typeof Object.create != 'function') {
        //Object.create(prototype, descriptors)
        Object.create = (function() {
            function Temp() {}
            var hasOwn = Object.prototype.hasOwnProperty;
            return function (O) {
                if (typeof O != 'object') {
                    throw TypeError('Object prototype may only be an Object or null');
                }
                Temp.prototype = O;
                var obj = new Temp();
                Temp.prototype = null;
                if (arguments.length > 1) {
                    var Properties = Object(arguments[1]);
                    for (var prop in Properties) {
                        if (hasOwn.call(Properties, prop)) {
                            obj[prop] = Properties[prop];
                        }
                    }
                }
                return obj;
            };
        })();
    }
    var isFunction = function(obj) {
        return typeof obj == 'function' || false;
    };
    function proxySuper(superFn, fn) {
        return function() {
            var tmp = this._super;
            this._super = superFn;
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
        }
    }
    //如果浏览器不支持Class原生，模拟一个
    if (typeof Class != 'function') {
        window.Class = function Class(){ };
        Class.extend = function (protoProps) {
            var parent = this, _super = parent.prototype, child;
            if (protoProps && protoProps.hasOwnProperty('constructor')) {
                child = proxySuper(parent, protoProps.constructor);
                delete protoProps.constructor; // remove constructor
            } else {
                child = function () {
                    parent.apply(this, arguments);
                };
            }

            var prototype = Object.create(parent.prototype, {
                constructor: {
                    value: child,
                    enumerable: false,
                    writable: true,
                    configurable: true
                }
            });

            for (var name in protoProps) {
                prototype[name] = isFunction(protoProps[name]) && isFunction(_super[name]) && /\b_super\b/.test(protoProps[name])
                    ? proxySuper(_super[name], protoProps[name]) : protoProps[name];
            }
            child.prototype = prototype;
            child.extend = Class.extend;
            return child;
        };
    }

    //如果浏览器不支持String原生trim的方法，模拟一个
    if (!String.prototype.hasOwnProperty('trim')) {
        String.prototype.trim = function () {
            return this.replace(/^(\s|\r|\n|\r\n)*|(\s|\r|\n|\r\n)*$/g, '');
        };
    }
    //如果浏览器不支持Function原生bind的方法，模拟一个
    if (!Function.prototype.hasOwnProperty('bind')) {
        Function.prototype.bind = function (context) {
            var fn = this,args = arguments.length > 1 ? Array.slice(arguments, 1) : null;
            return function () {
                return fn.apply(context || this, args);
            };
        };
    }
    /**
     * Bone.namespace('ui.test');
     */
    Bone.namespace = function(name) {
        if (!name) {
            return window.Bone;
        }
        var ns    = window.Bone;
        var nsArr = name.split(".");
        for (var i = 0, l = nsArr.length; i < l; i++) {
            var n = nsArr[i];
            ns[n] = ns[n] || {};
            ns = ns[n];
        }
        return ns;
    };
    /**
     *
     * Bone.register('ui.test',function(Bone){ });
     *
     */
    Bone.register = function(ns, func) {
        var target;
        if (typeof ns == "function") {
            func = ns;
            target = Bone;
        } else if (typeof ns == "string") {
            target = Bone.namespace(ns);
        } else if (typeof ns == "object") {
            target = ns;
        }
        func && func.call(target, this); //把func放到target上
    };

    /**
     * useage:
     * Bone.Class(superClass,{ init:function(options){ } });
     * Bone.Class({ init:function(options){ } });
     *
     */
    Bone.Class = function() {
        var length = arguments.length;
        var option = arguments[length - 1];
        var extendOwn = function(destination, source) {
            for (var n in source) {
                if (source.hasOwnProperty(n)) {
                    destination[n] = source[n];
                }
            }
            return destination;
        };
        option.init = option.init || function() {};
        if (length === 2) {
            var superClass = arguments[0].extend;
            var tempClass = function() {};
            tempClass.prototype = superClass.prototype;
            var subClass = function() {
                return new subClass.prototype._init(arguments);
            };
            subClass.superClass = superClass.prototype;
            subClass.callSuper = function(context, func) {
                var slice = Array.prototype.slice;
                var a = slice.call(arguments, 2);
                var func = subClass.superClass[func];
                if (func) {
                    func.apply(context, a.concat(slice.call(arguments)));
                }
            };
            subClass.prototype = new tempClass();
            subClass.prototype.constructor = subClass;
            extendOwn(subClass.prototype, option);

            subClass.prototype._init = function(args) {
                this.init.apply(this, args);
            };
            subClass.prototype._init.prototype = subClass.prototype;
            return subClass;

        } else if (length === 1) {
            var newClass = function() {
                return new newClass.prototype._init(arguments);
            };
            newClass.prototype = option;
            newClass.prototype._init = function(arg) {
                this.init.apply(this, arg);
            };
            newClass.prototype.constructor = newClass;
            newClass.prototype._init.prototype = newClass.prototype;
            return newClass;
        }
    };
    /**
     * Sets up the prototype chain and constructor property for a new class.
     *
     * This should be called right after creating the class constructor.
     *
     * 	function MySubClass() {
     * 	   MySuperClass.call(this, options);
     * 	}
     * 	Bone.inherit(MySubClass, MySuperClass);
     * 	MySubClass.prototype.doSomething = function() { }
     *
     * 	var foo = new MySubClass();
     * 	console.log(foo instanceof MySuperClass); // true
     * 	console.log(foo.prototype.constructor === MySubClass); // true
     *
     * @method extend
     * @param {Function} subclass The subclass.
     * @param {Function} superclass The superclass to extend.
     * @return {Function} Returns the subclass's new prototype.
     */
    Bone.inherit = function(subclass, superclass) {
        if(typeof superclass !== 'function' ){
            superclass = function () {}
        }
        function o() { this.constructor = subclass; }
        o.prototype = superclass.prototype;
        return (subclass.prototype = new o());
    }; 

    Bone.register("ui",function(Bone){
        var evt  = Bone.Events;
        var _    = Bone._;
        var HelloWorld = Bone.Class({
            init:function(options){
                console.log(' init  ui HelloWorld ok!');
            }
        });
        this.HelloWorld = HelloWorld; //exports to Bone.ui.HelloWorld
    });

    Bone.register(function(Bone){
        //例如,直接定义函数
        var myCookie = {
            get : function(name) {
                var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)");
                var m = window.document.cookie.match(r);
                return (!m ? "" : m[1]);
            }
        };
        // this.myCookie = myCookie; //挂载实例变量上
        Bone.myCookie = myCookie; //挂载实例Bone上
    });
    
    

}(window));