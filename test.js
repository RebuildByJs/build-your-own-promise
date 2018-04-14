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

var p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('p1');
    resolve(1);
  }, 1000);
});

var p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('p2');
    resolve(2);
  }, 2000);
});

var p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('p3');
    resolve(3);
  }, 3000);
});

Promise.all([p1, p2, p3]).then((res) => { console.log(res); }, (err) => { console.log(err); });
Promise.race([p1, p2, p3]).then((res) => { console.log('rate', res); }, (err) => { console.log(err); });


Promise.resolve('test resolve').then((res) => { console.log(res); });
Promise.reject('fuck you').then((err) => { console.log('not here'); }, (err) => { console.log(err); });

console.log('finally', Promise.resolve(1).finally(() => {}));