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
    
    function _resolve() {

    }

    function _reject() {

    }

    fn(_resolve, _reject);
    
    return this;
  }
  
  then(onFulfilled, onRejected) {

    return new Promise();
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