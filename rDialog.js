/**
 * 对话框 guoqingzhou
 * useage:3种用法
 * 1 创建一个对话框
 * $.rDialog({ content : '对话框内', title : '对话框dialog',
 *    ok : function() {  return false; //'我是确定按钮，回调函数返回false时不会关闭对话框  },
 *    cancel : function() {   //我是取消按钮  },
 *    lock : false //mask });
 * });
 * 2秒自动关闭
 * $.rDialog({  content : '窗口将在2秒后自动关闭', title: "alert", width: 320, time : 2000 });
 * 3 loding
 * $.rDialog({ time : 1000});
 */

(function (root, factory) {
    "use strict";
    var rDialog  = factory(root, root.jQuery || root.Zepto);

    if (typeof define === "function") {
        define('ui/rDialog',function(require, exports, module) {
            module.exports  = rDialog;
        })
    }

}(this, function (root, $) {
    var win = $(window),
        doc = $(document),
        count = 1,
        isLock = false;

    $.widget("ui.dialog", {
        options: {},
        defaults:{
            // 内容
            content: '加载中...',

            // 标题
            title: '',

            // 宽度
            width: 'auto',

            // 高度
            height: 'auto',

            // 确定按钮回调函数
            ok: null,

            // 取消按钮回调函数
            cancel: null,

            // 确定按钮文字
            okText: '确定',

            // 取消按钮文字
            cancelText: '取消',

            // 自动关闭时间(毫秒)
            time: null,

            // 是否锁屏
            lock: true,

            // z-index值
            zIndex: 9999

        },
        settings:{},
        _create: function () {
            this.settings = $.extend({}, this.defaults, this.options); //合并参数
            var ts= new Date().getTime();
            var divHeader = (this.settings.title==null)?'':'<div class="rDialog-header-'+ this.settings.title +'"></div>';
            // HTML模板
            var templates = '<div class="rDialog-wrap ' +'ts-'+ts+ '">' +
                divHeader +
                '<div class="rDialog-content">'+ this.settings.content +'</div>' +
                '<div class="rDialog-footer"></div>' +
                '</div>';

            // 追回到body
            this.dialog  = $('<div>').addClass('rDialog').css({ zIndex : this.settings.zIndex + (count++) }).html(templates).prependTo('body');
            this.element = this.dialog;
            // 设置ok按钮
            if ($.isFunction(this.settings.ok)) {
                this.ok();
            }

            // 设置cancel按钮
            if ($.isFunction(this.settings.cancel)) {
                this.cancel();
            }
            // 设置大小
            this.size();
            // 设置位置
            this.position();
        },
        _getCreateOptions:function () {

        },
        _getCreateEventData:function () {

        },
        _init :function(){
            if (this.settings.lock) {
                this.lock();
            }
            if (!isNaN(this.settings.time)&&this.settings.time!=null) {
                this.time();
            }
        },
        /**
         * ok
         */
        ok : function() {
            var _this = this,
                footer = _this.dialog.find('.rDialog-footer');

            $('<a>', {
                href : 'javascript:;',
                text : this.settings.okText
            }).on("click", function() {
                var okCallback = _this.settings.ok();
                if (okCallback == undefined || okCallback) {
                    _this.close();
                }
            }).addClass('rDialog-ok').prependTo(footer);

        },
        /**
         * cancel
         */
        cancel : function() {
            var _this = this,
                footer = _this.dialog.find('.rDialog-footer');
            $('<a>', {
                href : 'javascript:;',
                text : this.settings.cancelText
            }).on("click",function() {
                var cancelCallback = _this.settings.cancel();
                if (cancelCallback == undefined || cancelCallback) {
                    _this.close();
                }
            }).addClass('rDialog-cancel').appendTo(footer);
        },

        /**
         * 设置大小
         */
        size : function() {
            var _this = this;
            var content = _this.dialog.find('.rDialog-content'),
                wrap = _this.dialog.find('.rDialog-wrap');

            content.css({
                width : this.settings.width,
                height : this.settings.height
            });
        },
        /**
         * 设置位置
         */
        position : function() {
            var _this = this,
                winWidth = win.width(),
                winHeight = win.height(),
                scrollTop = 0;
            this.dialog.css({
                left : (winWidth - _this.dialog.width()) / 2,
                top : (winHeight - _this.dialog.height()) / 2 + scrollTop
            });

        },

        /**
         * mask设置锁屏
         */
        lock : function() {
            if (isLock) return;
            this.lock = $('<div>').css({ zIndex : this.settings.zIndex }).addClass('rDialog-mask');
            this.lock.appendTo('body');
            isLock = true;
        },
        /**
         * 关闭锁屏
         */
        unLock : function() {
            if (this.settings.lock) {
                if (isLock) {
                    this.lock.remove();
                    isLock = false;
                }
            }
        },
        close : function() {
            this.dialog.remove();
            this.unLock();
        },
        time : function() {
            var _this = this;
            var costTime = this.settings.time||0;
            if (typeof costTime === 'number' && costTime > 0) {
                this.closeTimer = setTimeout(function() {
                    _this.close();
                }, costTime);
            }else{
                _this.close();
            }
        }
    });

    //代理下
    var rDialog = function(options) {
        return new $.ui.dialog(options);
    };

    $.rDialog = rDialog;

    return rDialog;

}));
