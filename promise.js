/**
 * Promise build by zhangxiang
 */
module.exports = class Promise {
  constructor(fn) {
    if(!(this instanceof Promise)) return new Promise();
    
    // 内部状态 status
    this.status = 'pending';
    
    /**
     * 内部变量用 _ 开头
     */
    function _resolve() {

    }

    function _reject() {

    }

    return this;
  }
  
  then(onFulfilled, onRejected) {

  }

  catch() {

  }

  all() {

  }

  race() {
    
  }
};


function noop() {}