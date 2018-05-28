/**
 * Created by LIHUA on 2017-08-17.
 *  辅助工具类
 */

declare let CryptoJS: any;
import {Injectable} from '@angular/core';

@Injectable()
export class ToolService {

    /**
     * 单次执行方法，resolve解除锁定
     * @type {(func) => () => any}
     */
    single = (function() {
        return function(func) {

            let resolve = function() {
                func['running'] = false;
            };

            return function() {
                if (func['running']) {
                    return;
                } else {
                    func['running'] = true;
                    let args = Array.prototype.slice.call(arguments);
                    args.push(resolve);
                    func.apply(this, args);
                }
            };
        };
    })();

    /**
     * http://www.cnblogs.com/zztt/p/4098657.html 参考
     * 频率控制函数， fn执行次数不超过 1 次/delay
     * @param fn{Function}     传入的函数
     * @param delay{Number}    时间间隔
     * @param options{Object}  如果想忽略开始边界上的调用则传入 {leading:false},
     *                         如果想忽略结束边界上的调用则传入 {trailing:false},
     * @returns {Function}     返回调用函数
     */

    throttle = function (fn, delay, options?) {
        let wait = false;
        options = options || {};

        return function () {
            let that = this,
                args = arguments;

            if (!wait) {
                if (!(options.leading === false)) {
                    fn.apply(that, args);
                }

                wait = true;
                setTimeout(function () {
                    if (!(options.trailing === false)) {
                        fn.apply(that, args);
                    }
                    wait = false;
                }, delay);
            }
        };
    };

    /**
     * http://www.cnblogs.com/zztt/p/4098657.html 参考
     * 空闲控制函数，fn仅执行一次
     * @param fn{Function}     传入的函数
     * @param delay{Number}    时间间隔
     * @param options{Object}  如果想忽略开始边界上的调用则传入 {leading:false},
     *                         如果想忽略结束边界上的调用则传入 {trailing:false},
     * @returns {Function}     返回调用函数
     */
    debounce = function(fn, delay, option?) {
        let timeoutId, leadingExc = false;
        option = option || {};

        return function () {
            let that = this,
                args = arguments;
            if (!leadingExc && !(option.leading === false)) {
                fn.apply(that, args);
            }

            leadingExc = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(function () {
                if (!(option.trailing === false)) {
                    fn.apply(that, args);
                }
                leadingExc = false;
            }, delay);
        };
    };

    /**
     * 滚动到顶部
     */
    scrollTop = function (ele?: any) {
        ele = ele ? ele : (document.documentElement || document.body);

        const scrollToTop = () => {
            const c = ele.scrollTop;
            if (c > 0) {
                window.requestAnimationFrame(scrollToTop);
                window.scrollTo(0, c - c / 8);
            }
        };

        scrollToTop();
    };

    /**
     * 滚动到底部
     * @param element
     */
    scrollBottom = function (element) {
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    };

    /**
     * 获取32位uuid
     * @param len 长度
     * @param radix 基数
     * @returns {string}
     */
    getUuid = function (len = 32, radix?) {
        let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        let uuid = [], i;
        radix = radix || chars.length;

        if (len) {
            for (i = 0; i < len; i++) {
                uuid[i] = chars[0 | Math.random() * radix];
            }
        } else {
            let r;
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    };

    /**
     * 判定真值 然后执行
     * @param first  判定函数
     * @param second 执行函数
     * @param time   定时
     */
    run = (first, second, time) => {
        if (first()) {
            second();
        } else {
            setTimeout(() => {
                this.run(first, second, time);
            }, time);
        }
    }

    /**
     * 获取元素的dom位置
     * @param element
     * @returns {{x: (number | any); y: (number | any)}}
     */
    getElementPositionPoint = (element: any) => {
        let x = element.offsetLeft,
            y = element.offsetTop;
        while (element = element.offsetParent) {
            x += element.offsetLeft;
            y += element.offsetTop;
        }
        return {x, y};
    }

    /**
     * 树形初始化
     * @param trees 原始数据
     * @param options 配置参数
     */
    treesInit = (trees: any, options?: TreesConfig) => {
        options.id = options.id || 'id';
        options.pid = options.pid || 'pid';
        options.children = options.children || 'children';
        options.topValue = options.topValue || '0';

        let d = JSON.parse(JSON.stringify(trees));
        let list = options.container || [];
        let find = false;

        while (d.length) {
            let temp = d.shift();

            // 顶级节点
            if (temp[options.pid] === options.topValue) {
                list.push(temp);
                options.callback && options.callback(temp);
            } else {
                find = false;
                this.treesTraverse(list, {
                    callback: (leaf) => {
                        if (temp[options.pid] === leaf[options.id]) {
                            leaf[options.children] = leaf[options.children] || [];
                            delete temp['findindex'];
                            leaf[options.children].push(temp);
                            options.callback && options.callback(temp);
                            find = true;
                        }
                    }
                });
                if (!find) {
                    temp['findindex'] = temp['findindex'] || 0;
                    temp['findindex']++;
                    if (temp['findindex'] < 2) { // 丢掉已经被检查过两遍的脏数据
                        d.push(temp);
                    }
                }
            }
        }

        return list;
    }

    /**
     * 树形节点遍历
     * @param trees
     * @param {TreesConfig} options
     */
    treesTraverse = (trees: any, options?: TreesConfig) => {
        options.children = options.children || 'children';

        let temp = [].concat(trees), tem;
        while (temp.length) {
            tem = temp.pop();
            options.callback && options.callback(tem);

            if (tem[options.children] && tem[options.children].length) {
                temp = temp.concat(tem[options.children]);
            }
        }
    }

    /**
     * 在树形里搜索指定节点，并返回节点的父节点集合
     * 根据当前选中节点 查找父节点
     * http://www.cnblogs.com/lycnblogs/archive/2017/05/18/6874389.html 具体查找算法看这篇文章
     * @param trees
     * @param tree
     */
    treesPositions = (trees: any, tree: any, option: TreesConfig = {}) => {
        option.children = option.children || 'children';

        let temp = [];

        try {
            let getNode = (node) => {
                  temp.push(node);

                  if (node === tree) {
                      throw Error('GOT IT!');
                  }
                  if (node[option.children] && node[option.children].length) {
                      node[option.children].forEach(n => {
                            getNode(n);
                      });
                      temp.pop();
                  } else {
                      temp.pop();
                  }
            };

            trees.forEach(t => {
                getNode(t);
            });

        } catch (e) {
            return temp;
        }
    }

    /**
     * CryptoJS 对称加密
     * @param {string} text 加密文本
     * @param {string} key 密匙
     * @param {string} method 加密方法
     */
    encrypt = (text: string, key: string, method = 'DES') => {
        let keyHex = CryptoJS.enc.Utf8.parse(key);
        let en = CryptoJS[method].encrypt(text, keyHex, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString();

        return en;
    }

    decrypt = (text: string, key: string, method = 'DES') => {
        let keyHex = CryptoJS.enc.Utf8.parse(key);
        let de = CryptoJS[method].decrypt({
            ciphertext: CryptoJS.enc.Base64.parse(text)
        }, keyHex, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });

        return de.toString(CryptoJS.enc.Utf8);
    }

    isUndefined = (value) => {
        return typeof value === 'undefined';
    }

    isDefined = (value) => {
        return typeof value !== 'undefined';
    }

    isObject = (value) => {
        return value != null && typeof value === 'object';
    }

    isString = (value) => {
        return typeof value === 'string';
    }

    isNumber = (value) => {
        return typeof value === 'number';
    }

    isDate = (value) => {
        return toString.call(value) === '[object Date]';
    }

    isArray = (value) => {
        return toString.call(value) === '[object Array]';
    }

    isFunction = (value) => {
        return typeof value === 'function';
    }

    isRegExp = (value) => {
        return toString.call(value) === '[object RegExp]';
    }

    isFile = (value) => {
        return toString.call(value) === '[object File]';
    }

    isBoolean = (value) => {
        return typeof value === 'boolean';
    }

    /**
     * 深度拷贝
     * @param oldObj
     * @returns {any}
     */
    deepCopy = (oldObj) => {
        let newObj = oldObj;
        if (oldObj && typeof oldObj === 'object') {
            newObj = Object.prototype.toString.call(oldObj) === '[object Array]' ? [] : {};
            for (let i of Object.keys(oldObj)) {
                newObj[i] = this.deepCopy(oldObj[i]);
            }
        }
        return newObj;
    }

    /**
     * 包含判定
     * @param val
     * @param arr
     * @returns {boolean}
     */
    contains = (val: any, arr: any) => {
        return new Set(arr).has(val);
    }

    /**
     * 文件类型后缀检查
     * @param {string} name 待检查的文件名
     * @param {string} type 文件类型
     * @returns {boolean}
     */
    fileCheck = (name: string, type: string) => {
        let types = {
            xml: ['xml'],
            jar: ['jar'],
            hive: ['sql'],
            shell: ['sh'],
            scala: ['jar'],
            spark: ['jar', 'sql', 'py'],
            xls: ['xls', 'xlsx'],
            sql: ['sql', 'hql']
        };

        let last = name.substr(name.lastIndexOf('.') + 1);
        if (name && last) {
            return this.contains(last, types[type]);
        }
    }
}

/**
 * 树形初始化 配置参数
 */
export interface TreesConfig {
    callback?: Function;            // 每成功初始化一个数据 回调一次
    pid?: string | 'pid';           // pid label
    id?: string | 'id';             // id label
    children?: string | 'children'; // children label
    topValue?: string | '0';        // 跟id的值
    container?: any;                // 接受树形结构的数组
}
