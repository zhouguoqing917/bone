
Bone._build = [
    'src/js/bone/basic.js',
    'src/js/bone/events.js',
    'src/js/bone/radio.js',
    'src/js/bone/object.js',
    'src/js/bone/triggerMethod.js',
    'src/js/bone/model.js',
    'src/js/bone/collection.js',
    'src/js/bone/view.js',
    'src/js/bone/sync.js',
    'src/js/bone/history.js',
    'src/js/bone/router.js',
    'src/js/bone/templateCache.js',
    'src/js/bone/region.js',
    'src/js/bone/modelView.js',
    'src/js/bone/collectionView.js',
    'src/js/bone/application.js' ];

var NavItem = Bone.ModelView.extend({
    tagName: 'li',
    template: _.template('<a href="<%= href %>"><%= text %></a>')
});
var Nav = Bone.CollectionView.extend({
    ModelView: NavItem,
    tagName: 'ul',
    template: _.template('<li>before</li><li class="last">last</li>'),
    appendHtml: function(element) {
        this.$('.last').before(element);
    }
});

var Main = Bone.View.extend({
    template: _.template('<p>Some content</p>')
});

var navCollection = new Backbone.Collection([
    { text: 'home', href: '/' },
    { text: 'google', href: 'http://google.com/' }
]);

var App = Bone.View.extend({
    el: $('body'),
    template: _.template(
        '<nav><%= view("nav") %></nav>' +
        '<%= view("contents") %>'
    ),
    regions: {
        nav: false,
        contents: new Main()
    }
});

var app = (new App()).render();
app.contents.render();

var nav = new Nav({collection: navCollection});
app.nav.attach(nav.render());
