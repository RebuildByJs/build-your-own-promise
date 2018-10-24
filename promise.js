/**
 * Builded By zhangxiang on 2018/03
 */

const PENDING = 0;
const ONFULFILLED = 1;
const ONREJECTED = 2;
const nextTick = process.nextTick;
class Promise {
  constructor(fn) {
    if(!(this instanceof Promise)) return new Promise(fn);
    
    this.status = PENDING;
    this.taskQueue = [];
    // _resolve 函数与 _reject 函数需要被作为函数调用，也就是说内部没有 this 值调用
    function _resolve(res) {
      this.status = ONFULFILLED;
      this.data = res;
      nextTick(() => {
        for (let task of this.taskQueue) {
          let func = task.resolve;
          func(this.data);
        }
        this.taskQueue = [];
      });
    }

    function _reject(res) {
      this.status = ONREJECTED;
      this.data = res;
      nextTick(() => {
        for (let task of this.taskQueue) {
          let func = task.reject;
          func(this.data);
        }
        this.taskQueue = [];
      });
    }

    _resolve = _resolve.bind(this);
    _reject = _reject.bind(this);

    fn(_resolve, _reject);
    
    return this;
  }
  
  static next({ onFulfilled, onRejected }) {

    if (PENDING === this.status) {
      this.taskQueue.push({ resolve: onFulfilled, reject: onRejected });
      return;
    }

    if (ONFULFILLED === this.status) {
      onFulfilled(this.data);
    } else if (ONREJECTED === this.status) {
      onRejected(this.data);
    }
  }

  then(onFulfilled, onRejected) {
    const next = Promise.next.bind(this);
    if (typeof onFulfilled !== 'function') { onFulfilled = () => {};}
    if (typeof onRejected !== 'function') { onRejected = () => {};}
    return new Promise((resolve, reject) => {
      next({
        onFulfilled: (res) => {
          let result = onFulfilled(res);
          resolve(result);
        },
        onRejected: (err) => {
          let error = onRejected(err);
          reject(error);
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