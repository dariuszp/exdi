exdi [![Build Status](https://travis-ci.org/dariuszp/exdi.png?branch=master)](https://travis-ci.org/dariuszp/exdi)
====

Dependency injection container for JavaScript

## 1.1.4
Container queue added. Now you can create queue of async functions that will be executed using container as context.
This feature is experimental.
Usage:

```JavaScript
var exdi = require('exdi');

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
```

## 1.1.2

* fixes .execute(). Now there is a third parameter - execution context. If no context object is provided, function is executed using container as context.

In other words, when you are executing function or getting "constructor" from container, this of that function will be pointing to given object or container itself.

To do that, do:
```JavaScript
exdi.execute(myFunction, [ my: 'params' ], someObject);
```
or
```JavaScript
exdi.get('SomeConstructor', [ my: 'params' ], someObject);
```
where some object is... well some object and function under "SomeConstructor" will be called in the same way like this:
someObject.someConstructor([ my: 'params' ]).


## 1.1.1

To install exdi use
```JavaScript
npm install exdi
```
or add nesesery dependency into package.json and then execute 
```JavaScript
npm install
```
Then include exdi into your project.
```JavaScript
var exdi = require('exdi');
```
Now it is time to create your first container.
```JavaScript
var myContainer = exdi.get('myContainer');
```
If you don't want container to be registered in exdi for some reason, you can always create anonymous container.
```JavaScript
var myNotRegisteredContainer = exdi.create();
```
Now every time you execute **exdi.get('myContainer');** same container will be returned. If container under given name is not present, new container will be created. So **watch out for misspells**.
Every time you use **exdi.create();** new container will be returned.

Now to set value, you just need to use:
```JavaScript
myContainer.set('myValue', 5);
```
To get value use:
```JavaScript
myContainer.get('myValue'); // will return 5
```
To make sure you don't get undefined value, set default value when you request parameter:
```JavaScript
myContainer.get('myMissingValue', 4); // will return 4
```
Exdi follow simple convention.
> Every value name that starts with capital letter is a constructor. So only acceptable value is a **function**.
> Every value name that starts with small letter have simple value.
> Difference between constructos and other parameters is that constructors are execute every time you are trying to get them.

So if you do something like this:
```JavaScript
myContainer.set('Builder', 'Hello world');
```
Exdi will **throw an error**.
This will work:
```JavaScript
myContainer.set('Builder', function () {
    return 'Hello world';
});
myContainer.get('Builder'); // Hello world
```
Builders can use all container parameters, including other builders.
```JavaScript
myContainer.set('Builder', function (luckyNumber) {
    return 'Lucky number ' + luckyNumber;
});
myContainer.set('luckyNumber', 7);
myContainer.get('Builder'); // Lucky number 7
```
or
```JavaScript
myContainer.set('Builder', function (LuckyNumber) {
    return 'Lucky number ' + LuckyNumber;
});
myContainer.set('LuckyNumber', function () {
  return 'IS 7';
});
myContainer.get('Builder'); // Lucky number IS 7
```
You can also execute any function with container parameters.
```JavaScript
function showX(x, y) {
    return x + ' ' + y;
}

myContainer.set('x', 5);
myContainer.set('y', 5);
myContainer.execute(showXY);
```
And if you need to overwrite one of the container parameters (or provide new), you can always pass object as second parameter of execute:
```JavaScript
myContainer.execute(showXY, {
    y: 1
});
```
You can even have builders in builders:
```JavaScript
myContainer.set('One', function () {
    return 'THIS';
});
myContainer.set('Two', function (One) {
    return One + ' IS';
});
myContainer.set('Three', function (Two) {
    return Two + ' SPARTA!';
});
myContainer.get('Three'); // THIS IS SPARTA!
```
And there is no reason why you should not have containers in containers:
```JavaScript
myContainer2 = exdi.get('myContainer2');
myContainer.set('x', 1);
myContainer2.set('x', 2);

myContainer2.set('c', myContainer);

myContainer2.set('Test', function (c, x) {
    return x + c.get('x');
});

myContainer2.get('Test'); // Should be 3
```
Quite useful if you ask me.
