const Promise = require('./promise.js');

var p = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('?????');
    resolve(1);
  }, 1000);
});


p.then((res) => {
  console.log(res);
}).then(() => {
  console.log('second then');
});

console.log('???');