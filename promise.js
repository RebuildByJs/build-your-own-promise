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
      for (let task of this.taskQueue) {
        let func = task.resolve;
        func(this.data);
      }
      this.taskQueue = [];
    }

    function _reject(res) {
      this.status = ONREJECTED;
      this.data = res;
      for (let task of this.taskQueue) {
        let func = task.reject;
        func(this.data);
      }
      this.taskQueue = [];
    }

    _resolve = _resolve.bind(this);
    _reject = _reject.bind(this);

    fn(_resolve, _reject);
    
    return this;
  }
  
  static next({ onFulfilled, onRejected }) {
    if (ONFULFILLED === this.status) {
      onFulfilled(this.data);
    } else if (ONREJECTED === this.status) {
      onRejected(this.data);
    } else {
      this.taskQueue.push({ resolve: onFulfilled, reject: onRejected });
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

  catch() {

  }

  resolve() {

  }

  reject() {

  }

  all() {

  }

  race() {
    
  }
};


function noop() {}