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

  catch(fn) {

  }

  resolve(fn) {
    return new Promise((resolve, reject) => {
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    });
  }

  reject(fn) {
    return new Promise((resolve, reject) => {
      try {
        reject(fn());
      } catch (err) {
        reject(err);
      }
    });
  }

  all(promises) {
    if(!Array.isArray(promises)) {
      console.error('Promise.all arguments must be an array.');
      return;
    }
    for (let promise of promies) {
      if (!(promise instanceof Promise)) {
        console.log('variable must be a Promise instance.');
        return;
      }
    }

    return new Promise((resolve, reject) => {
      let next = Promise.next.bind(this);
      next({
        onFulfilled: () => {

        },
        onRejected: () => {

        }
      });
    });
  }

  race(promises) {
    if(!Array.isArray(promises)) {
      console.error('Promise.all arguments must be an array.');
      return;
    }
    for (let promise of promies) {
      if (!(promise instanceof Promise)) {
        console.log('variable must be a Promise instance.');
        return;
      }
    }

    return new Promise((resolve, reject) => {
      let next = Promise.next.bind(this);
      next({
        onFulfilled: () => {
          
        },
        onRejected: () => {

        }
      });
    });
  }
};


function noop() {}