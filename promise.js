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
        let reason = this.reason = void 0;
        let taskQueue = this.taskQueue = [];
        // _resolve 函数与 _reject 函数需要被作为函数调用，也就是说内部没有 this 值调用
        function _resolve(res) {
            // 正确实现
            /**
             * 意思就是，遇到是一个鸭子还不行，thenable 还是需要再包一层 Promise
             * 也就是经典的问题 resolve(Promise.resolve()) 里面干了啥
             * if (res && typeof res.then === 'function') {
             *  new Promise((_res, _rej) => {
             *      res.then(_res, _rej);
             *  }).then(_resolve, _reject);
             * }
             */
            // 错误实现
            if (res instanceof Promise) { // 靠他妈的！！！这里实现居然不是这个鸟样
                return res.then(_resolve, _reject);
            }
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
                reason = res;
                nextTick(() => {
                    for (let task of taskQueue) {
                        let func = task.reject;
                        func(reason);
                    }
                    taskQueue = [];
                });
            }
        }
        try {
            fn(_resolve, _reject);
        } catch (err) {
            _reject(err);
        }
    
        return this;
    }
    /**
     * 让 then 函数适应各种函数返回值
     * @param {*} promise then 函数返回的新的 Promise
     * @param {*} x 
     * @param {*} resolve 
     * @param {*} reject 
     */
    static resolvePromise(promise, x, resolve, reject) {
        if (promise === x) {
            throw new TypeError('Cycle Error');
        }
        let called = false;
        if (x instanceof Promise) {
            if (x.status === PENDING) {
                x.then(y => {
                    this.resolvePromise(promise, y, resolve, reject)
                }, reason => {
                    reject(reason);
                });
            } else {
                x.then(resolve, reject);
            }
        } else if (x !== null && (typeof x == 'object' || typeof x == 'function')) {
            try {
                let then = x.then;
                if (then && typeof then == 'function') {
                    then.call(x, y => {
                        if (called) return;
                        called = true;
                        this.resolvePromise(promise, y, resolve, reject);
                    }, reason => {
                        if (called) return;
                        called = true;
                        reject(reason);
                    });
                } else {
                    resolve(x);
                }
            } catch (err) {
                if (called) return;
                called = true;
                reject(err);
            }
        } else {
            resolve(x);
        }
    }

    then(onFulfilled, onRejected) {
        /**
         * 如果不是函数需要忽略它
         */
        if (typeof onFulfilled !== 'function') onFulfilled = val => val;
        if (typeof onRejected !== 'function') onRejected = reason => { throw reason; };
        /**
         * then 方法必须返回一个 promise 对象
         */
        let newPromise;
        if (this.status === PENDING) {
            return newPromise = new Promise((resolve, reject) => {
                this.taskQueue.push({
                    resolve: value => {
                        try {
                            let x = onFulfilled(value);
                            Promise.resolvePromise(newPromise, x, resolve, reject);
                        } catch (err) {
                            reject(err);
                        }
                    },
                    reject: reason => {
                        try {
                            let x = onRejected(reason);
                            Promise.resolvePromise(newPromise, x, resolve, reject);
                        } catch (err) {
                            reject(err);
                        }
                    }
                });
            });
        }
        if (this.status === REJECTED) {
            return newPromise = new Promise((resolve, reject) => {
                nextTick(() => {
                    try {
                        let x = onRejected(this.reason);
                        Promise.resolvePromise(newPromise, x, resolve, reject);
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        }
        if (this.status === FULFILLED) {
            return newPromise = new Promise((resolve, reject) => {
                nextTick(() => {
                    try {
                        let x = onFulfilled(this.value);
                        Promise.resolvePromise(newPromise, x, resolve, reject);
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        }
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