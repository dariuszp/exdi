exdi
====

Dependency injection container for JavaScript

## 1.0.0

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
function showX(x) {
    return x;
}

myContainer.set('x', 5);
myContainer.execute(showX);
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

Quite useful if you ask me.