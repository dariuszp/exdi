'use strict';

var exdi = require(__dirname + '/../src/exdi.js');

var container = exdi.create();
var queue = container.createQueue();

container.set('MyConstructor', function () {
    return 'And this is my constructor example. Hehe :]';
})

queue.add(function (exdiDone, age) {
    this.set('name', 'Dariusz');
    this.set('age', age || 0);
    exdiDone();
}, {
    age: 26
});

queue.add(function (exdiDone) {
    this.set('surname', 'Półtorak');
    exdiDone();
});

queue.add(function (exdiDone, MyConstructor) {
    console.log(this.get('name') + ' ' + this.get('surname') + ', age: ' + this.get('age'));
    console.log(MyConstructor);
    exdiDone();
});

queue.run();