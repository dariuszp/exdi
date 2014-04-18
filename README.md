exdi [![Build Status](https://travis-ci.org/dariuszp/exdi.png?branch=master)](https://travis-ci.org/dariuszp/exdi)
====

### Installation

```JavaScript
npm install exdi
```

After that, include exdi in Your file:

```JavaScript
var exdi = require('exdi');
```

### Usage

Exdi is a dependency injection container. But whole library is practically a repository of containers.
There are two ways to create container:

*Named container:*

```JavaScript
var container = exdi.get('myContainer');
```

That will create new container and register it under "myContainer" name. So each time you ask for myContainer, same instance will be returned.

Or you can just spawn anonymous container using:

```JavaScript
var container = exdi.create();
```

This will create unregisted container so there is no way to get it again from inside Exdi.

### Values and constructors

Basic feature is to set and create container values. Using our "container" variable, we an do this like that:

```JavaScript
container.set('name', 'Will'); // this will set "name" variable with "Will" value.
container.set('surname', 'Smith'); // this will set "surname"

container.get('surname'); // this will return "Smith"
```

Now, it would be not much of dependency injection container if we would not be able to build things using dependencies.

```JavaScript
container.set('FullName', function (name, surname) {
    return name + ' ' + surname;
});
```

Constrution above will register a constructor. Constructors are executed each time you want to retreive them using .get() method.
So this code:

```JavaScript
container.get('FullName');
```

will return "Will Smith". There are few things to remember:

* _First capital letter_ is reserverd for constructors. It's _very important_. If key have capital letter as first sign, you can only set a function as value. This way that function will be executed each time you want to retreive it.
* If you would use small letter and call it "fullName", code above would return registered function instead of result of that function.
* Look how "name" and "surname" is handled. Exdi will extract parameters names and match them with container values. So there is no need for You to provide them. Just remember to have them in container before using constructor.
* You can also pass other constructors as parameter. Like this:

```JavaScript
container.set('age', '27');
container.set('AgeAndFullName', function (age, FullName) {
    return FullName + ', age ' + age;
})

container.get('AgeAndFullName'); // Will Smith, age 27
```

#### REMEMBER

If you register function like this:

```JavaScript
container.set('FullName', function (name, surname) {
    return name + ' ' + surname;
});
```

*container.get('FullName')* will return result of a function since first capital letter means *Constructor*. This follow convention that most JS progremmers use.
So you will get "Will Smith". If you register function like this:

```JavaScript
container.set('fullName', function (name, surname) {
    return name + ' ' + surname;
});
```

*container.get('FullName')* will return whole function instead of executing it.

### Executing any function

Sometimes you will want just execute one of Your functions without registering it in container. You can do it like this:

```JavaScript
function add(x, y) {
    return x + y;
}

container.set('x', 1);
container.set('y', 2);

container.execute(add); // this will return 3
```

And sometimes, you will want to overwrite some container values with Yours without changing them in container:

```JavaScript
function add(x, y) {
    return x + y;
}

container.set('x', 1);
container.set('y', 2);

container.execute(add, {
    y: 5
}); // this will return 6. x is intact, y is replaced by 5 but only for execution of a function. Container value is intact.
```

Also there is a problem of methods. Sometimes you have methods, functions that are part of bigger object and you want
to execute them BUT you don't want to loose object context. In other words, you don't want "this" pointing to something
else than that object. It's also possible like this:

```JavaScript
var myObj = {
    this.add = function add(x, y) {
        return x + y + this.z;
    },
    z: 4
}

container.set('x', 1);
container.set('y', 2);

container.execute(add, {}, myObj); // this will return 7
```

As you see, just provide object as third parameter and it will be used as context of execution.
If context object is not provided, "this" will point to container object. So inside your function
you can for example call

```JavaScript
function add(x, y) {
    this.get('name'); // Will
    return x + y;
}
```

### Queue nad Parallel

Sometimes, you need to take control over code execution. It's hard to do since most of the time You will be dealing with
async functions. For that, Exdi have tools like Queue and Parallel. Both can be created using methods with the same names:

```JavaScript
var queue = container.createQueue();
```

OR

```JavaScript
var parallel = container.createParallel();
```

Main difference between queue and paraller is simple. Queue will execute one function at that time in chain. So
second function in queue will be executed ONLY if first one is finished. Library will report when each step is done
and will also report using events that all steps are finished.

Parallel works in simmilar way but all functions will be called at the same time. It's like a "promise" pattern.

To add function to queue or parallel,, use .add() method:

```JavaScript
function soSomethingCool(x, y, exdiDone) {
    this.get('name'); // Will
    // here some async code
    return x + y;
    exdiDone();
}

queue.add(soSomethingCool);
queue.add(soSomethingCool); // again
// or
parallel.add(soSomethingCool);
parallel.add(soSomethingCool); // again if you want
```

to run either of them, you can use:

```JavaScript
queue.execute(); // will start queue
parallel.execute(); //will start parallel
```

Functions passed to queue and parallel are quite different. Notice custom aprameter "exdiDone". It's a function that
You should call when it's finished. Remember we are dealing with async functions. So when you do what You have to do,
call:

```JavaScript
exdiDone();
```

or next function will not be called in Queue and Parallel will never finish. You can register events for both libraries:

```JavaScript
queue.on('timeout', function () { /* too long */ }); // called after X seconds
```

Timeout is fired IF code execution takes too long. You can change default value (0) using *queue.setTimeoutLimit(5);*

Same way, you can register events for parallel. There are two events available:

* step
* done

To cancel execution of both tools, use:

```JavaScript
queue.clearQueue(); // clear queue, function currently in execution will finish but next one will not be fired
parallel.clearTasks(); // function can finish but step and done event wont called
```

### Minified code

Sometimes, programmers use tools that minify JavaScript code making it unreadable but short and small.
This will change variable names in Your code. So for example this:

```JavaScript
container.set('fullName', function (name, surname) {
    return name + ' ' + surname;
});
```

will look like this after minification:

```JavaScript
container.set('fullName', function (a, b) {
    return a + ' ' + b;
});
```

As You probably noticed, this will not work anymore. There is no 'a' and 'b' in our container. There is a way to fix that.

Just pass array first list of keys and function as last argument. This way, container will match function arguments based on
order and values of array keys instead of function arguments. Just like that:

```JavaScript
container.set('fullName', ['name', 'surname', function (a, b) {
    return a + ' ' + b;
}]);
```

Now Your cod work again.

## REMEMBER

* always use small first letter when registering a value
* when you set value with first capital letter, you need to pass function and when You try to retrive that key, function will be executed and result of that function will be returned
* if you register function with small name, code of that function will be returned
* queue will run one function at a time but parallel will start them all at once
* you can pass array with keys and function as last argument to avoid problems with minification
* you can register containers in exdi using .get('name') or create anonymous ones using .create()
