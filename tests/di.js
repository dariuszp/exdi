'use strict';

var assert = require('assert'),
    Container = require(__dirname + '/../src/Container.js'),
    di = require(__dirname + '/../index.js');

assert.doesNotThrow(
    function() {
        var myContainer;// = di.create();
        if ((myContainer instanceof Container) === false) {
            throw new Error();
        }
    },
    "unexpected error"
);
