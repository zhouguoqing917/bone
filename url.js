/**
 * 该文件用于定义url工具类

 *
 **/

(function ($) {


    var URL = {
        /**
         * @summary parseQueryString 将url中的参数转换为json数据对象键值对形式的对象
         * @type {function}
         * @param {string} queryString              - 可选参数, 如果不指定url，则默认从当前页面url中获取参数
         * @return {object}
         */
        parseQueryString: function (queryString) {
            if (queryString === "" || queryString == null) return {};
            if (queryString.charAt(0) === "?") queryString = queryString.slice(1);
            /* 去掉字符串前面的"?"，并把&amp;转换为& */
            queryString = queryString.replace(/^\?+/, '').replace(/&amp;/, '&');
            var entries = queryString.split("&"), data = {}, counters = {};
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i].split("=");
                var key = decodeURIComponent(entry[0]);
                var value = entry.length === 2 ? decodeURIComponent(entry[1]) : "";

                if (value === "true") value = true;
                else if (value === "false") value = false;
                var levels = key.split(/\]\[?|\[/);
                var cursor = data;
                if (key.indexOf("[") > -1) levels.pop();
                for (var j = 0; j < levels.length; j++) {
                    var level = levels[j], nextLevel = levels[j + 1];
                    var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
                    var isValue = j === levels.length - 1;
                    if (level === "") {
                        var key = levels.slice(0, j).join();
                        if (counters[key] == null) counters[key] = 0;
                        level = counters[key]++
                    }
                    if (cursor[level] == null) {
                        cursor[level] = isValue ? value : isNumber ? [] : {};
                    }
                    cursor = cursor[level];
                }
            }
            return data;
        },

        /**
         * @memberOf buildQueryString URL
         * @summary 参数对象转为url QueryString 字符串
         * @type {function}
         * @param {Json object } obj     - 设置url对象
         * @return {string} url
         */
        buildQueryString: function (obj) {
            if (Object.prototype.toString.call(obj) !== "[object Object]") return "";
            function destructure(key, value) {
                if (Array.isArray(value)) {
                    for (var i = 0; i < value.length; i++) {
                        destructure(key + "[" + i + "]", value[i])
                    }
                }
                else if (Object.prototype.toString.call(value) === "[object Object]") {
                    for (var i in value) {
                        destructure(key + "[" + i + "]", value[i])
                    }
                }
                else args.push(encodeURIComponent(key) + '=' + (value != null && value !== "" ? encodeURIComponent(value) : ""))
            }

            var args = [];
            for (var key in object) {
                destructure(key, object[key]);
            }
            return args.join("&");
        },
        /**
         * @memberOf URL
         * @summary 获取当前页面连接中指定参数
         * @type {function}
         * @param {string} param1   - 如果param2为undefined，param1是指从当前页面url中获取指定参数的key, 如果param2不为空，param1为指定的url
         * @param {string} param2   - 可选参数，如果param2存在，则从指定的param1连接中获取对应参数的key
         * @return {string|null}
         */
        getParam: function (param1, param2) {
            var reg, url, param;
            if (typeof param2 === 'undefined') {
                url = window.location.href;
                param = param1;
            } else {
                url = param1;
                param = param2;
            }
            reg = new RegExp("(^|&|\\\\?)" + param + "=([^&]*)(&|$|#)");
            var rstArr = url.match(reg);
            if (rstArr !== null) {
                return decodeURIComponent(rstArr[2]);
            }
            return null;
        },

        /**
         * @memberOf URL
         * @summary 向指定url中添加多个参数
         * @type {function}
         * @param {string} url                      - 指定url链接
         * @param {string|object} param             - 为string时,param表示key，param2标志value; object时，忽略param2，将对象中所有属性添加到url中
         * @param {string} param2                   - 当param为string时生效，标志value
         * @return {string}
         */
        setParam: function (url, name, val) {
            //只添加1个参数
            if (typeof url === 'undefined') {
                url = window.location.href ||'';
            }
           var  _setParam = function (url, name, val) {
                try {

                    if (typeof url !== 'undefined' && typeof name !== 'undefined' && typeof val !== 'undefined') {
                        val = encodeURIComponent(val);

                        if (url.indexOf('?') === -1) {
                            url += '?' + name + '=' + val;

                        } else {
                            var urlParamArr = url.split('?');
                            var pStr = urlParamArr[1];
                            var pArr = pStr.split('&');
                            var findFlag = false;

                            $.each(pArr, function (index, item) {
                                var paramArr = item.split('=');

                                if (name === paramArr[0]) {
                                    findFlag = true;
                                    pArr[index] = name + '=' + val;

                                    return false;
                                }
                            });

                            if (!findFlag) {
                                url += '&' + name + '=' + val;

                            } else {
                                url = urlParamArr[0] + '?' + pArr.join('&');
                            }
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
                return url;
            };

            if (typeof name === 'string' && typeof val !== 'undefined') {
                return _setParam(url, name, val);
            } else if (typeof name === 'object') {
                for (var i in name) {
                    url = _setParam(url, i, param[i]);
                }
                return url;
            } else {
                return url;
            }
        }

    };

    $.URL = URL;


}($));