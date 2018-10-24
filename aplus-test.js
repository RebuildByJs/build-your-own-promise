var promisesAplusTests = require('promises-aplus-tests');
var adapter = require('./promise');

promisesAplusTests(adapter, () => {
    console.log('all done');
});