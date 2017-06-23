(function () {
// render Template underscoreTemplate/Handlebars/vue ;三者选其中1个做为模板
// need Bone.TemplateCache
    /**
     *
     * var template = "#some-template";
     var data = {foo: "bar"};
     var html = new Bone.Render().render(template, data);

     or
     var myTemplate = _.template("<div>foo</div>");
      Bone.view.extend({
           template: myTemplate
      });
     */
    Bone.Renderer = {
        render: function render(template, data) {
            if (!template) {
                throw new BoneError('Cannot render the template since its false, null or undefined.');
            }
            var templateFunc = _.isFunction(template) ? template :
                Bone.TemplateCache.get(template);
            return templateFunc(data);
        }
    }; 
}(this));