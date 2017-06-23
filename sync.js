(function () {
    // Bone.sync
    // -------------

    Bone.$ = $;
    Bone.emulateHTTP = true;
    Bone.emulateJSON = true;
    window['jsonpHandler'] = function(obj) {};

    Bone.sync = function(method, model, options) {
        var type = methodMap[method]||'get';
        options.success = options.success ||options.callback;
        // Default options, unless specified.
        _.defaults(options || (options = {}), {
            emulateHTTP: Bone.emulateHTTP,
            emulateJSON: Bone.emulateJSON
        });

        // Default JSON-request options.
        var params =  {
            type: type,
            dataType: options.dataType || 'jsonp',
            timeout:options.timeout || 1500,
            cache:options.cache || true,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
        };
        
        if (!options.url) {
            params.url = _.result(model, 'url') ||_.result(model, 'urlRoot') || urlError();
        }else{
            params.url = options.url;
        }

        if (options && options.data == null && model) {
            params.data  =  options.urlData || _.result(model, 'urlData') || JSON.stringify(options.attrs) || model.toJSON(options);
        }
        if (options.data == null && model && (type === 'create' || method === 'update' || method === 'patch')) {
            params.contentType = 'application/json';
        }
        if (options.emulateJSON) {
            params.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
            params.data = params.data ?  params.data : {};
        }

        // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
        // And an `X-HTTP-Method-Override` header.
        if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
            params.type = 'POST';
            if (options.emulateJSON) params.data._method = type;
            var beforeSend = options.beforeSend;
            options.beforeSend = function(xhr) {
                xhr.setRequestHeader('X-HTTP-Method-Override', type);
                if (beforeSend) return beforeSend.apply(this, arguments);
            };
        }

        // Don't process data on a non-GET request.
        if (params.type !== 'GET' && !options.emulateJSON) {
            params.processData = false;
        }

        // Pass along `textStatus` and `errorThrown` from jQuery.
        var error = options.error;
        options.error = function(xhr, textStatus, errorThrown) {
            options.textStatus = textStatus;
            options.errorThrown = errorThrown;
            if (error) error.call(options.context, xhr, textStatus, errorThrown);
        };
        var ajaxOptions =_.extend(params, options);
        console.log("Bone sync url "+ ajaxOptions.url + "?" + $.param(ajaxOptions.data));
        // Make the request, allowing the user to override any Ajax options.
        var xhr = options.xhr = Bone.ajax(ajaxOptions);
        model.trigger('request', model, xhr, options);
        return xhr;
    };

    // Map from CRUD to HTTP for our default `Bone.sync` implementation.
    var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'patch':  'PATCH',
        'delete': 'DELETE',
        'read':   'GET',
        'get':   'GET',
        'post':   'POST'
    };

    // Set the default implementation of `Bone.ajax` to proxy through to `$`.
    // Override this if you'd like to use a different library.
    Bone.ajax = function() {
        return Bone.$.ajax.apply(Bone.$, arguments);
    };

    Bone.ajaxSync = Bone.sync; //save 

}(this));