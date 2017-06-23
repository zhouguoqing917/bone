(function () {
// Template Cache
// --------------

    Bone.TemplateCache = function (templateId) {
        this.templateId = templateId;
    };

    _.extend(Bone.TemplateCache, {
        templateCaches: {},
        get: function (templateId, options) {
            var cachedTemplate = this.templateCaches[templateId];

            if (!cachedTemplate) {
                cachedTemplate = new Bone.TemplateCache(templateId);
                this.templateCaches[templateId] = cachedTemplate;
            }
            return cachedTemplate.load(options);
        },

        clear: function () {
            var i;
            var args = _.toArray(arguments);
            var length = args.length;

            if (length > 0) {
                for (i = 0; i < length; i++) {
                    delete this.templateCaches[args[i]];
                }
            } else {
                this.templateCaches = {};
            }
        }
    });

    _.extend(Bone.TemplateCache.prototype, {
        load: function (options) {
            if (this.compiledTemplate) {
                return this.compiledTemplate;
            }

            var template = this.loadTemplate(this.templateId, options);
            this.compiledTemplate = this.compileTemplate(template, options);

            return this.compiledTemplate;
        },

        loadTemplate: function (templateId, options) {
            var $template = Bone.$(templateId);
            if (!$template.length) {
                throw new Error('Could not find template: "' + templateId + '"');
            }
            return $template.html();
        },

        // Pre-compile the template before caching it. Override
        // this method if you do not need to pre-compile a template
        // (JST / RequireJS for example) or if you want to change
        // the template engine used (Handebars, etc). 
        compileTemplate: function (rawTemplate, options) {
            var tplType = options && options.tplType || this.options.tplType || 0;
            if (tplType == 1 && root.Handlebars) {
                return root.Handlebars.compile(rawTemplate, options);
            } else {
                return _.template(rawTemplate, options);
            }
        }
    });
    
}(this));