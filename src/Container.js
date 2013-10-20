'use strict';

function getFunctionParametersNames(fn) {
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
        FN_ARG_SPLIT = /\s*,\s*/,
        FN_ARG = /^\s*(_?)(.+?)\1\s*$/,
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    var i = 0,
        fnText,
        argDecl,
        args,
        arg,
        parameters = [];

    if (typeof fn !== 'function') {
        throw new Error('To extract parameters names you must provide a function');
    }

    fnText = fn.toString().replace(STRIP_COMMENTS, '');
    argDecl = fnText.match(FN_ARGS);
    args = argDecl[1].split(FN_ARG_SPLIT);

    if (args.length) {
        for (i = 0; i < args.length; i++) {
            if (args[i]) {
                parameters.push(args[i]);
            }
        }
    }

    return parameters;
}

function Container(container) {
    if ((this instanceof Container) === false) {
        return new Container(container);
    }
    if (!container) {
        container = {};
    }

    /**
     * set value, remember that first upper case force DI container to create new
     * element if it is a function. So first upper case means that value is a constructor
     * @param name
     * @param value
     * @returns {*}
     */
    this.set = function (name, value) {
        if (name[0].toString().length === 0) {
            throw new Error('Invalid name');
        }
        if (name[0].toString() === name[0].toString().toUpperCase() && typeof value !== 'function') {
            throw new Error('All variables named using first capital letter are constructors and must have first capital letter.');
        }
        container[name] = value;
        return this;
    };

    this.get = function (name) {
        if (name[0].toString().length === 0) {
            throw new Error('Invalid name');
        }
        if (name[0].toString() === name[0].toString().toUpperCase() && typeof container[name] === 'function') {
            return this.execute(container[name]);
        }
        return container[name];
    };

    this.execute = function (fn, params) {
        if (!params) {
            params = [];
        }
        if (typeof fn !== 'function') {
            throw new Error('You can only execute a function');
        }

        var fnParametersNames = [],
            applyParameters = [],
            i = 0;

        fnParametersNames = getFunctionParametersNames(fn);
        if (fnParametersNames.length > 0) {
            for (i = 0; i < fnParametersNames.length; i++) {
                if (params[fnParametersNames[i]]) {
                    applyParameters.push(params[fnParametersNames[i]]);
                    continue;
                }
                if (container[fnParametersNames[i]]) {
                    applyParameters.push(this.get(fnParametersNames[i]));
                    continue;
                }
                applyParameters.push(undefined);
            }
        }

        return fn.apply(fn, applyParameters);
    };
}


module.exports = Container;