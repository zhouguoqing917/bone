/**
 *  Bone.store是localStorage包装工具类,兼容低端ie
 **/
(function(global) {
    'use strict';
    var store = {},
        win = window,
        doc = document,
        localStorageName = 'localStorage',
        scriptTag = 'script',
        storage;
    _ieStore;
    try {
        storage = win[localStorageName];
    } catch (e) {}
    var noop = function() {};
    store.disabled = false;
    store.getItem = noop;
    store.getItem = noop;
    store.removeItem = noop;
    store.clear = noop;
    store.getAll = noop;
    store.forEach = noop;

    store.transact = function(key, defaultVal, transactionFn) {
        var val = store.get(key);
        if (transactionFn === null) {
            transactionFn = defaultVal;
            defaultVal = null;
        }
        if (typeof val === 'undefined') {
            val = defaultVal || {};
        }
        transactionFn(val);
        store.set(key, val);
    };

    store.serialize = function(value) {
        return JSON.stringify(value);
    };
    store.deserialize = function(value) {

        if (typeof value !== 'string') {
            return undefined;
        }
        try {
            return JSON.parse(value);
        } catch (e) {
            return value || undefined;
        }
    };


    var isLocalStorageNameSupported = function() {
        try {
            return (localStorageName in win && win[localStorageName]);
        } catch (err) {
            return false;
        }
    };

    if (isLocalStorageNameSupported()) {
        storage = win[localStorageName];
        store.setItem = function(key, val) {
            if (val === undefined) {
                return store.removeItem(key);
            }
            storage.setItem(key, store.serialize(val));
            return val;
        };

        store.getItem = function(key) {
            return store.deserialize(storage.getItem(key));
        };
        store.removeItem = function(key) {
            storage.removeItem(key);
        };

        store.clear = function(prefix) {
            if (prefix) {
                for (var key in storage) {
                    if (0 === key.indexOf(prefix)) {
                        storage.removeItem(key);
                    }
                }
            } else {
                storage.clear();
            }
        };
        store.forEach = function(callback) {
            for (var i = 0; i < storage.length; i++) {
                var key = storage.key(i);
                callback(key, store.getItem(key));
            }
        };

    } else if (doc.documentElement.addBehavior) {

        var storageOwner,
            storageContainer;
        try {
            storageContainer = new ActiveXObject('htmlfile');
            storageContainer.open();
            var writeStr = '<' + scriptTag + '>document.w=window</' + scriptTag + '>';
            writeStr += '<iframe src="/favicon.ico"></iframe>';

            storageContainer.write(writeStr);
            storageContainer.close();
            storageOwner = storageContainer.w.frames[0].document;
            storage = storageOwner.createElement('div');

        } catch (e) {
            storage = doc.createElement('div');
            storageOwner = doc.body;
        }

        var withIEStorage = function(storeFunction) {
            var rst = function() {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift(storage);
                storageOwner.appendChild(storage);
                storage.addBehavior('#default#userData');
                storage.load(localStorageName);
                var result = storeFunction.apply(store, args);
                storageOwner.removeChild(storage);
                return result;
            };

            return rst;
        };
        var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");

        var ieKeyFix = function(key) {
            return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___');
        };

        store.setItem = withIEStorage(function(storage, key, val) {
            key = ieKeyFix(key);
            if (val === undefined) {
                return store.removeItem(key);
            }
            storage.setAttribute(key, store.serialize(val));
            storage.save(localStorageName);
            return val;
        });

        store.getItem = withIEStorage(function(storage, key) {
            key = ieKeyFix(key);
            return store.deserialize(storage.getAttribute(key));
        });

        store.removeItem = withIEStorage(function(storage, key) {
            key = ieKeyFix(key);
            storage.removeAttribute(key);
            storage.save(localStorageName);
        });

        store.clear = withIEStorage(function(storage, prefix) {
            var attributes = storage.XMLDocument.documentElement.attributes;
            storage.load(localStorageName);
            if (prefix) {
                for (var i = 0, l = attributes.length; i < l; i++) {
                    var attr = attributes[i];
                    if (0 === attr.name.indexOf(prefix)) {
                        storage.removeAttribute(attr.name);
                    }
                }
            } else {
                for (var i = 0, l = attributes.length; i < l; i++) {
                    var attr = attributes[i];
                    storage.removeAttribute(attr.name);
                }
            }
            storage.save(localStorageName);
        });

        store.forEach = withIEStorage(function(storage, callback) {
            var attributes = storage.XMLDocument.documentElement.attributes;
            for (var i = 0, l = attributes.length; i < l; i++) {
                var attr = attributes[i];
                callback(attr.name, store.deserialize(storage.getAttribute(attr.name)));
            }
        });

        _ieStore = store;
    }
    store._init = function() {
        try {
            var testKey = '__storejs__';
            store.setItem(testKey, testKey);
            if (store.getItem(testKey) !== testKey) {
                store.disabled = true; 
                console.log('not support localStorage!!!');
            } 
            store.removeItem(testKey);
        } catch (e) {
            store.disabled = true;
        }
        store.enabled = !store.disabled;  
    }

    store.getAll = function() {
        var ret = {};
        store.forEach(function(key, val) {
            ret[key] = val;
        });
        return ret;
    };
    store._init(); 
    Bone.store = store; 
    
}(window));
