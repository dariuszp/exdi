'use strict';

var Container       = require(__dirname + '/../src/Container.js'),
    Containers      = require(__dirname + '/../src/Containers.js'),
    di              = require(__dirname + '/../index.js');

exports.mainReturnConstructors = function(test){
    test.ok(di instanceof Containers, 'Main faile does not return Containers instance');
    test.done();
};

exports.containersCreateNewContainer = function (test) {
    test.ok(di.create() instanceof Container, 'Containers did not create new container');
    test.done();
};

exports.containersGetCreateNewContainer = function (test) {
    var myNewContainer = di.get('myNewContainer');
    test.ok(myNewContainer instanceof Container, 'Containers .get() did not create new container');
    test.done();
};

exports.containersGetReturnSameContainerSecondTime = function (test) {
    var myAnotherNewContainer = di.get('myAnotherNewContainer');
    myAnotherNewContainer.set('test', 5);
    var myAnotherNewContainer2 = di.get('myAnotherNewContainer');
    test.strictEqual(myAnotherNewContainer2.get('test'), 5, 'Containers .get() did not create new container');
    myAnotherNewContainer2.set('test', 2);
    test.strictEqual(myAnotherNewContainer.get('test'), 2, 'Containers .get() did not create new container');
    test.done();
};

exports.containerConstructorAcceptFunctions = function (test) {
    var mySuccessConstructorContainer = di.get('mySuccessConstructorContainer');
    test.doesNotThrow(function () {
        mySuccessConstructorContainer.set('Test', function () {});
    }, undefined, 'Container accept only functions as constructor');
    test.done();
};

exports.containerConstructorFailIfValueIsNotAConstructor = function (test) {
    var myFailedConstructorContainer = di.get('myFailedConstructorContainer');
    test.throws(function () {
        myConstructorContainer.set('Test', 5);
    }, undefined, 'If parameters name start with capital letter you must provide constructor function as value');
    test.done();
};

exports.specialCharactersAreNotConstructors = function (test) {
    var mySpecialCharContainer = di.get('mySpecialCharContainer');
    mySpecialCharContainer.set('_test', function () { return 'Test'; });
    test.strictEqual(typeof mySpecialCharContainer.get('_test'), 'function', 'Special characters should not trigger construction');
    test.done();
};

exports.smallLetterValuesDoesNotExecuteFunctions = function (test) {
    var mySmallValueContainer = di.get('mySmallValueContainer');
    mySmallValueContainer.set('test', function () { return 1; });
    test.ok(typeof mySmallValueContainer.get('test') === 'function', 'Small letter parameters should not execute functions');
    test.done();
};

exports.constructorUseContainerParameters = function (test) {
    var parametersConstructor = di.get('parametersConstructor');
    parametersConstructor.set('myValue', 'exdi');
    parametersConstructor.set('Builder', function (myValue) {
        return 'This is ' + myValue;
    });
    test.strictEqual(parametersConstructor.get('Builder'), 'This is exdi', 'Builder does not use container parameters');
    test.done();
};

exports.constructorUseOtherConstructors = function (test) {
    var parametersConstructor = di.get('parametersConstructor2');
    parametersConstructor.set('myValue', 'exdi');
    parametersConstructor.set('Version', function () {
        return '1.0.0';
    });
    parametersConstructor.set('Builder', function (myValue, Version) {
        return 'This is ' + myValue + ' version: ' + Version;
    });
    test.strictEqual(parametersConstructor.get('Builder'), 'This is exdi version: 1.0.0', 'Builder does not use container builders');
    test.done();
};

exports.thirdLevelBuildersTest = function (test) {
    var thirdLevelContainer = di.get('3rd');
    thirdLevelContainer.set('One', function () {
        return 'THIS';
    });
    thirdLevelContainer.set('Two', function (One) {
        return One + ' IS';
    });
    thirdLevelContainer.set('Three', function (Two) {
        return Two + ' SPARTA!';
    });
    test.strictEqual(thirdLevelContainer.get('One'), 'THIS', 'First level builder failed');
    test.strictEqual(thirdLevelContainer.get('Two'), 'THIS IS', 'Second level builder failed');
    test.strictEqual(thirdLevelContainer.get('Three'), 'THIS IS SPARTA!', 'Third level builder failed');
    test.done();
};

exports.containerHandleUndefinedValues = function (test) {
    var parametersConstructor = di.get('parametersConstructor3');
    parametersConstructor.set('myValue', 'exdi');
    parametersConstructor.set('Version', function () {
        return '1.0.0';
    });
    parametersConstructor.set('Builder', function (myValue, missing, Version) {
        test.strictEqual(missing, undefined, 'Container does not handle missing values');
        return 'This is ' + myValue + ' version: ' + Version;
    });
    test.strictEqual(parametersConstructor.get('Builder'), 'This is exdi version: 1.0.0', 'Builder does not use container builders');
    test.done();
};

exports.containerDeletion = function (test) {
    var all = di.all();
    all.parametersConstructor2.set('test', 5);
    test.strictEqual(all.parametersConstructor2.get('test'), 5, 'Defined container is missing');
    test.ok(all.parametersConstructor2 !== undefined, 'Defined container is missing');
    di.delete('parametersConstructor2');
    test.ok(all.parametersConstructor2 === undefined, 'Defined container is not removed');
    di.get('parametersConstructor2');
    test.ok(all.parametersConstructor2.get('test') === undefined, 'Defined container is not removed');
    test.done();
};

exports.deleteUndefinedContainer = function (test) {
    test.doesNotThrow(function () {
        di.delete('undefinedContainer');
    }, undefined, 'Failed to delete undefined container');

    test.doesNotThrow(function () {
        di.get('garbageContainer').delete('undefinedValue');
    }, undefined, 'Failed to delete undefined container parameter');

    test.done();
};

exports.testReadmeExamples = function (test) {
    var exdi = require(__dirname + '/../index.js');
    var myContainer = exdi.get('myContainer');
    test.ok(myContainer instanceof Container, 'Example 1');


    myContainer.set('myValue', 5);
    test.strictEqual(myContainer.get('myValue'), 5, 'Example 2');


    test.throws(function () {
        myContainer.set('Builder', 'Hello world');
    }, undefined, 'Example 3');


    myContainer.set('Builder', function () {
        return 'Hello world';
    });
    test.strictEqual(myContainer.get('Builder'), 'Hello world', 'Example 4');


    myContainer.set('Builder', function (luckyNumber) {
        return 'Lucky number ' + luckyNumber;
    });
    myContainer.set('luckyNumber', 7);
    test.strictEqual(myContainer.get('Builder'), 'Lucky number 7', 'Example 5');


    myContainer.set('Builder', function (LuckyNumber) {
        return 'Lucky number ' + LuckyNumber;
    });
    myContainer.set('LuckyNumber', function () {
        return 'IS 7';
    });
    test.strictEqual(myContainer.get('Builder'), 'Lucky number IS 7', 'Example 6');


    function showX(x) {
        return x;
    }
    myContainer.set('x', 5);
    test.strictEqual(myContainer.execute(showX), 5, 'Example 7');


    myContainer.set('One', function () {
        return 'THIS';
    });
    myContainer.set('Two', function (One) {
        return One + ' IS';
    });
    myContainer.set('Three', function (Two) {
        return Two + ' SPARTA!';
    });
    test.strictEqual(myContainer.get('Three'), 'THIS IS SPARTA!', 'Example 8');

    test.done();
};