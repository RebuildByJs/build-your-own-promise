/**
 * Builded By zhangxiang on 2018/03
 */

/**
 * Promise 的状态值, 规范规定的三个状态
 * @param PENDING 0
 * @param FULFILLED 1
 * @param REJECTED 2
 */
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
/**
 * 让 Promise 的异步可配置，可以使用 setTimeout/process.nextTick
 */
const nextTick = process.nextTick;
class Promise {
    constructor(fn) {
        if(!(this instanceof Promise)) return new Promise(fn);
        /**
         * 规范规定需要
         * @param value 合法值
         * @param reason 拒绝的原因
         * @param exception throw 语句抛出的一个值
         */
        let status = this.status = PENDING;
        let value = this.value =  void 0;
        let taskQueue = this.taskQueue = [];
        // _resolve 函数与 _reject 函数需要被作为函数调用，也就是说内部没有 this 值调用
        function _resolve(res) {
            // 这里添加 PENDING 判断是为了防止 resolve 执行多次，规范规定 reoslve 不能执行多于一次
            if (status === PENDING) {
                status = FULFILLED;
                value = res;
                nextTick(() => {
                    for (let task of taskQueue) {
                        let func = task.resolve;
                        func(value);
                    }
                    taskQueue = [];
                });
            }
        }
        function _reject(res) {
            // 同上
            if (status === PENDING) {
                status = REJECTED;
                value = res;
                nextTick(() => {
                    for (let task of taskQueue) {
                        let func = task.reject;
                        func(value);
                    }
                    taskQueue = [];
                });
            }
        }

        fn(_resolve, _reject);
    
        return this;
    }

    static next({ onFulfilled, onRejected }) {
        if (PENDING === this.status) {
            this.taskQueue.push({ resolve: onFulfilled, reject: onRejected });
            return;
        }

        if (FULFILLED === this.status) {
            onFulfilled(this.value);
        } else if (REJECTED === this.status) {
            onRejected(this.value);
        }
    }

    then(onFulfilled, onRejected) {
        const next = Promise.next.bind(this);
        /**
         * 如果不是函数需要忽略它
         */
        if (typeof onFulfilled !== 'function') { onFulfilled = () => {};}
        if (typeof onRejected !== 'function') { onRejected = () => {};}
        /**
         * then 方法必须返回一个 promise 对象
         */
        return new Promise((resolve, reject) => {
            next({
                onFulfilled: (res) => {
                    try {
                        let result = onFulfilled(res);
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                },
                onRejected: (err) => {
                    try {
                        let error = onRejected(err);
                        reject(error);
                    } catch (err) {
                        reject(err);
                    }
                }
            });
        });
    }

    catch(fn) {
        return this.then(null, fn);
    }

    finally(fn) {
        return this.then((res) => {
            return Promise.resolve(fn()).then(() => res);
        }, (err) => {
            return Promise.reject(fn()).then(() => err);
        });
    }

    static resolve(arg) {
        return new Promise((resolve, reject) => {
            if (arg instanceof Promise) {
                return arg;
            }
            if (arg && arg.then && typeof arg.then === 'function') {
                return new Promise(arg.then);
            }
            resolve(arg);
        });
    }

    static reject(arg) {
        return new Promise((resolve, reject) => {
            if (arg instanceof Promise) {
                return arg;
            }
            if (arg.then && typeof arg.then === 'function') {
                return new Promise(arg.then);
            }
            reject(arg);
        });
    }

    static all(promises) {
        if(!Array.isArray(promises)) {
            console.error('Promise.all arguments must be an array.');
            return;
        }

        const results = [];

        return new Promise((resolve, reject) => {
            promises.forEach((promise, i) => {
                if (!(promise instanceof Promise)) {
                    console.log('variable must be a Promise instance.');
                    return;
                }
                promise.then((res) => {
                    results[i] = res;
                    if (results.length === promises.length) {
                        resolve(results);
                        return;
                    }
                }, (err) => {
                    reject(err);
                });
            });
        });
    }

    static race(promises) {
        if(!Array.isArray(promises)) {
            console.error('Promise.race arguments must be an array.');
            return;
        }

        return new Promise((resolve, reject) => {
            promises.forEach((promise, i) => {
                if (!(promise instanceof Promise)) {
                    console.log('variable must be a Promise instance.');
                    return;
                }
                promise.then((res) => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
            });
        });
    }
};

Promise.deferred = function () {
    var global = {};

    var promise = new Promise(function (onResolve, onReject) {
        global.onResolve = onResolve;
        global.onReject = onReject;
    });

    var resolve = function (value) {
        global.onResolve(value);
    };

    var reject = function (reason) {
        global.onReject(reason);
    }

    return {
        promise,
        resolve,
        reject
    }
}

module.exports = Promise;