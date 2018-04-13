/**
 * Builded By zhangxiang on 2018/03
 */

const PENDING = 0;
const ONFULFILLED = 1;
const ONREJECTED = 2;
const nextTick = process.nextTick;

module.exports = class Promise {
  constructor(fn) {
    if(!(this instanceof Promise)) return new Promise(fn);
    
    this.status = PENDING;
    this.taskQueue = [];
    
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
    
  }

  static resolve(arg) {
    return new Promise((resolve, reject) => {
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    });
  }

  static reject(arg) {
    return new Promise((resolve, reject) => {
      try {
        reject(fn());
      } catch (err) {
        reject(err);
      }
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
      console.error('Promise.all arguments must be an array.');
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
