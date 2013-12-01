if (typeof window !== 'undefined') {
    window.exdi = {};
}

// TODO: use name "exdiNext" to run async content

(function (global) {
    'use strict';

    /**
     * Extract parameter names from any function
     */
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

    /**
     * Dependency injection container
     * @param container
     * @returns {Container}
     * @constructor
     */
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
         * @returns Container
         */
        this.set = function (name, value) {
            name = String(name);
            if (name.length === 0) {
                throw new Error('Invalid name');
            }
            if (/^[A-Z]/.test(name[0].toString()) && typeof value !== 'function') {
                throw new Error('All variables named using first capital letter are constructors and must have first capital letter.');
            }
            container[name] = value;
            return this;
        };

        /**
         * Get container value
         * @param name
         * @param params []|undefined
         * @returns {*}
         */
        this.get = function (name, params, constructorContext) {
            name = String(name);
            if (name.length === 0) {
                throw new Error('Invalid name');
            }
            if (/^[A-Z]/.test(name[0].toString()) && typeof container[name] === 'function') {
                return this.execute(container[name], params, constructorContext);
            }
            if (container[name] === undefined) {
                return params;
            }
            return container[name];
        };

        /**
         * Delete container value
         * @param name
         */
        this.delete = function (name) {
            name = String(name);
            delete container[name];
            return this;
        };

        /**
         * Execute given function using container parameters
         * @param fn
         * @param params
         * @returns {*}
         */
        this.execute = function (fn, params, context) {
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

            return fn.apply(context instanceof Object ? context : this, applyParameters);
        };
    }

    var containers = {};

    global.get = function (name) {
        name = String(name);
        if ((containers[name] instanceof Container) === false) {
            containers[name] = new Container();
        }
        return containers[name];
    };

    global.all = function () {
        return containers;
    };

    global.delete = function (name) {
        name = String(name);
        delete containers[name];
        return this;
    };

    global.create = function () {
        return new Container();
    };
})(typeof window === 'undefined' ? module.exports : window.exdi);