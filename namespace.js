window.svp = window.svp || {}; //svp 空间
window.ui = window.ui||{};  //ui空间
window.svp.$ =  window.svp.$ || window.Zepto || window.jQuery;
window.Bone  = window.Bone || {};
!function ($) {
    "use strict";
    if (typeof window.jQuery === 'undefined') {
        //throw new Error('Bootstrap\'s JavaScript requires jQuery')
        window.Zepto.event =window.Zepto.event ||{};
        window.Zepto.event.special = window.Zepto.event.special|| {};
        window.Zepto.support = window.Zepto.support|| {};
        window.Zepto.fn.jquery     = '1.11.3';
        window.jQuery        = window.Zepto;
    }

}(window.Zepto || window.jQuery );
//defined seajs module public api
if ( typeof define === "function" && window.seajs !='undefined' && window.jQuery) {
    define('jquery', function (require, exports, module) {
        module.exports = window.jQuery;
    });
}
