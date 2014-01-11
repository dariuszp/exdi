'use strict';

var exdi = require(__dirname + '/../src/exdi.js');

var container = exdi.create();
container.set('x', 1);

var parallel = container.createParallel();

parallel.add(function (exdiDone) {
    var c = this;
    setTimeout(function () {
        c.set('y', 2);
        exdiDone();
    }, 1000);
});

parallel.setTimeoutLimit(5000);

parallel.add(function (exdiDone) {
    var c = this;
    setTimeout(function () {
        c.set('z', 4);
        exdiDone();
    }, 3000);
});

parallel.on('step', function () {
    console.log('step done');
});

parallel.on('done', function (x,y,z) {
    console.log(x + y + z);
});

parallel.on('timeout', function () {
    console.log('timeout');
});

parallel.on('done', function () {
    parallel.execute();
});

parallel.execute();