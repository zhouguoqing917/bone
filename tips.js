/**
 * Created by guoqingzhou on 16/8/29.
 * useage:2种用法
 * 1. $.ui.tips({  kind:'poptips',  content: '温馨提示内容', time: 2000, type: "info"  }) ;
 * 2. $('#tipsWarp').tips({ kind:'tips', type:'warn', content:'提示的信息'});
 */
(function (root, factory) {
    "use strict";
    var tips  = factory(root, root.jQuery || root.Zepto);
    if (typeof define === "function") {
        define('ui/tips', function (require, exports, module) {
            module.exports =  tips;
        })
    }

}(this, function (root, $) {
    //ui-tips-info ,ui-tips-warn ,ui-tips-success
    // ui.tips(/* options, element */)

    $.widget("ui.tips", {
        options: {
            kind:'tips', //tips,poptips
            type:'info', //msginfo :info,warn,success,error
            content:'提示的信息',
            warp:'body',
            time:1000,
            callback:function(){}
        },
        tooltip:null,
        _create: function () {
            var me =this;
            // 默认模板 tips
            var tplstr = '<div class="ui-tips ui-tips-<%=type%>">'+
                '<i></i><span><%=content%></span>'+
                '</div>';

            var poptplstr  ='<div class="ui-poptips ui-poptips-<%=type%>">'+
                '<div class="ui-poptips-wrapper">' +
                '<div class="ui-poptips-content" >'+
                '<%=content%>'+
                '</div>'+
                '</div>'+
                '</div>';

            if(this.options.kind == 'poptips' ){
                me.tooltip  = $( $.tpl(poptplstr,{
                    type:this.options.type,
                    content:this.options.content
                }));

            }else{
                me.tooltip  = $( $.tpl(tplstr,{
                    type:this.options.type,
                    content:this.options.content
                }));
            }
            var ui_key="ui-widget-"+new Date().getTime();
            this._addClass(me.tooltip, ui_key );
            this.options.jswarp = ui_key;
            me.tooltip.appendTo( this.options.warp); //add to body

            if(this.options.kind == 'poptips' ) {
                var $tipWrapper = me.tooltip.find('.ui-poptips-wrapper');
                me.tooltip.css({'visibility': 'visible','margin-top': '-' + $tipWrapper.height() / 2 + 'px' });
            }
            this.element = me.tooltip;

        },
        _getCreateOptions:function () {
            return {};
        },
        isTouch :'ontouchstart' in window,
        _getCreateEventData:function () {
            if (this.options.kind == 'poptips') {
                this.element.one('click',   $.proxy(this._closeTip, this));
                if (this.isTouch) {
                    this.element.on('touchmove', function (e) {
                        e.preventDefault();
                    });
                }
            }
        },
        _closeTip: function () {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            if (this.isTouch) {
                this.element.off('touchmove');
            }
            this.element.remove();
        },
        _init :function(){
            var me =this;
            if (me.options.kind == 'poptips') {
                var milliSec = me.options.time || 0;
                if (typeof milliSec === 'number' && milliSec > 0) {
                    if (me.timer) {
                        clearTimeout(me.timer);
                        me.timer = null;
                    }
                    me.timer = setTimeout(function () {
                        me._closeTip();
                    }, milliSec);
                }
            }else{
                this.element.one('click',function () {
                    me.element.remove();
                });
            }
        } ,
        show: function () {
            this.element[0].style.display = 'block';
            return this;
        },
        hide: function () {
            this.element[0].style.display = 'none';
            return this;
        }
    });

    $.ui.tips.showTip = function(msg,tt){
        "use strict";
        $.ui.tips({  kind:'poptips',  content: msg, time: tt||1000}) ;
    };
    return $.ui.tips;
}));