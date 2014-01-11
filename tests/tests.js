'use strict';

var di = require(__dirname + '/../src/exdi.min.js');

exports.mainReturnConstructors = function(test){
    test.ok(di instanceof Object, 'Main faile does not return Containers instance');
    test.done();
};

exports.containersCreateNewContainer = function (test) {
    test.ok(di.create() instanceof Object, 'Containers did not create new container');
    test.done();
};

exports.containersGetCreateNewContainer = function (test) {
    var myNewContainer = di.get('myNewContainer');
    test.ok(myNewContainer instanceof Object, 'Containers .get() did not create new container');
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

exports.containerInContainer = function (test) {
    var myContainer1 = di.get('container1'),
        myContainer2 = di.get('container2');

    myContainer1.set('x', 1);
    myContainer2.set('x', 2);

    myContainer2.set('c', myContainer1);

    myContainer2.set('Test', function (x, c) {
        return x + c.get('x');
    });

    test.strictEqual(myContainer2.get('Test'), 3, 'Container in container does not work');
    test.done();
};

exports.getParameterDefaultValue = function (test) {
    var getContainer = di.get('getContainer');
    getContainer.set('one', 5);
    test.strictEqual(getContainer.get('one'), 5, 'Got invalid value');
    test.strictEqual(getContainer.get('two'), undefined, 'Not existing value is not undefined');
    test.strictEqual(getContainer.get('two', 4), 4, 'Default value is not 4');
    test.done();
};

exports.overwriteExecuteParameters = function (test) {
    var overwriteContainer = di.get('overwriteContainer');
    overwriteContainer.set('x', 1);
    overwriteContainer.set('y', 2);

    function add(x, y) {
        return x + y;
    }

    test.strictEqual(overwriteContainer.execute(add), 3, 'Execute did not extract parameters from container');
    test.strictEqual(overwriteContainer.execute(add, {
        x: 2
    }), 4, 'Execute did not overwrite container parameter');
    test.strictEqual(overwriteContainer.execute(add, {
        x: 2,
        y: 8
    }), 10, 'Execute did not overwrite both container parameter');

    function add2(x, y, z) {
        return x + y + z;
    }
    test.strictEqual(overwriteContainer.execute(add2, {
        z: 5
    }), 8, 'Adding another parameter did not worked');
    test.done();
}

exports.executionContext = function (test) {
    var ec = di.get('ec');
    ec.set('name', 'x');

    function fn() {
        return this.get('name') + 'y';
    }

    function fn2(name) {
        return name + 'y' + this.getLast();
    }

    var obj = {
        getLast: function () {
            return 'z';
        }
    };

    test.strictEqual(ec.execute(fn, []), 'xy');
    test.strictEqual(ec.execute(fn2, [], obj), 'xyz');

    test.done();
};

exports.testReadmeExamples = function (test) {
    var exdi = require(__dirname + '/../index.js');
    var myContainer = exdi.get('myContainer');
    test.ok(myContainer instanceof Object, 'Example 1');


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


    function showXY(x, y) {
        return x + ' ' + y;
    }

    myContainer.set('x', 5);
    myContainer.set('y', 5);
    test.strictEqual(myContainer.execute(showXY), '5 5', 'Example 7');
    test.strictEqual(myContainer.execute(showXY, {
        y: 1
    }), '5 1', 'Example 7.1');


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

    var myContainer2 = exdi.get('myContainer2');
    myContainer.set('x', 1);
    myContainer2.set('x', 2);

    myContainer2.set('c', myContainer);

    myContainer2.set('Test', function (c, x) {
        return x + c.get('x');
    });

    test.strictEqual(myContainer2.get('Test'), 3, 'Example 9');
    test.done();
};
