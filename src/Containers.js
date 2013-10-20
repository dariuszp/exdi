'use strict';

var Container = require(__dirname + '/Container.js');

function Containers() {
    if ((this instanceof Containers) === false) {
        return new Containers();
    }

    var containers = {};

    this.get = function (name) {
        if ((containers[name] instanceof Container) === false) {
            containers[name] = new Container();
        }
        return containers[name];
    };

    this.delete = function (name) {
        delete containers[name];
        return this;
    }

    this.create = function () {
        return new Container();
    };
}

module.exports = Containers;