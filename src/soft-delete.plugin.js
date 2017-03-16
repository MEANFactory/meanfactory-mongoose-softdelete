/* jshint -W101 */

var $           = require('mf-utils-node'),
    mongoose    = require('mongoose'),
    Model       = mongoose.Model;

module.exports = function (schema, options) {

    var auditFields = $.schemas.getAuditFields(schema);

    options = options || {};
    setOptions(options);

    if (!schema.path(options.path) && options.use !== false &&
        (options.type === Date || options.type === Boolean)) {

        var methods = options.methods;
        var path    = options.path;

        delete options.methods;
        delete options.path;
        delete options.use;

        var node = {};
        node[path] = options;
        schema.add(node);

        methods.forEach(function(method) {
            if (method === 'count' || method === 'find' || method === 'findOne') {
                if (options.type === Date) {
                    schema.statics[method] = function () {
                        return Model[method].apply(this, arguments).where('deleted').ne(true);
                    };
                    schema.statics[method + 'Deleted'] = function () {
                        return Model[method].apply(this, arguments).where('deleted').ne(false);
                    };
                    schema.statics[method + 'WithDeleted'] = function () {
                        return Model[method].apply(this, arguments);
                    };
                } else if (options.type === Boolean) {
                    schema.statics[method] = function () {
                        return Model[method].apply(this, arguments).where('deleted').equals(false);
                    };
                    schema.statics[method + 'Deleted'] = function () {
                        return Model[method].apply(this, arguments).where('deleted').equals(true);
                    };
                    schema.statics[method + 'WithDeleted'] = function () {
                        return Model[method].apply(this, arguments);
                    };
                }
            } else {
                schema.statics[method] = function () {
                    var args = parseUpdateArguments.apply(undefined, arguments);

                    if (options.type === Date) {
                        args[0][path] = {'$ne': true};
                    } else if (options.type === Boolean) {
                        args[0][path] = false;
                    }

                    return Model[method].apply(this, args);
                };

                schema.statics[method + 'Deleted'] = function () {
                    var args = parseUpdateArguments.apply(undefined, arguments);

                    if (options.type === Date) {
                        args[0][path] = {'$ne': false};
                    } else if (options.type === Boolean) {
                        args[0][path] = true;
                    }

                    return Model[method].apply(this, args);
                };

                schema.statics[method + 'WithDeleted'] = function () {
                    return Model[method].apply(this, arguments);
                };
            }
        });

        schema.methods.delete = function (deletedBy, cb) {
            var callback = (typeof deletedBy === 'function') ? deletedBy : cb;
            deletedBy = (cb !== undefined) ? deletedBy : null;

            if (options.type === Date) {
                this[path] = new Date();
            } else if (options.type === Boolean) {
                this[path] = true;
            }

            if (auditFields.member) {
                this[auditFields.member.path] = deletedBy;
            }

            if (options.validateBeforeDelete === false) {
                return this.save({ validateBeforeSave: false }, callback);
            }

            return this.save(callback);
        };

        schema.statics.delete =  function (conditions, deletedBy, callback) {
            if (typeof deletedBy === 'function') {
                callback = deletedBy;
                conditions = conditions;
                deletedBy = null;
            } else if (typeof conditions === 'function') {
                callback = conditions;
                conditions = {};
                deletedBy = null;
            }

            var doc = {};

            if (options.type === Date) {
                doc[path] = new Date();
            } else if (options.type === Boolean) {
                doc[path] = true;
            }

            if (auditFields.member) {
                doc[auditFields.member.path] = deletedBy;
            }

            if (this.updateWithDeleted) {
                return this.updateWithDeleted(conditions, doc, { multi: true }, callback);
            } else {
                return this.update(conditions, doc, { multi: true }, callback);
            }
        };

        schema.methods.restore = function (restoredBy, cb) {

            var callback = (typeof restoredBy === 'function' ? restoredBy : cb);
            restoredBy = (cb !== undefined) ? restoredBy : null;

            if (options.type === Date) {
                this[path] = undefined;
            } else if (options.type === Boolean) {
                this[path] = false;
            }

            if (auditFields.member) {
                this[auditFields.member.path] = restoredBy;
            }

            return this.save(callback);
        };

        schema.statics.restore =  function (conditions, restoredBy, callback) {
            if (typeof restoredBy === 'function') {
                callback = restoredBy;
                conditions = conditions;
                restoredBy = null;
            } else if (typeof conditions === 'function') {
                callback = conditions;
                conditions = {};
                restoredBy = null;
            }

            var doc = {};

            if (options.type === Date) {
                doc[path] = undefined;
            } else if (options.type === Boolean) {
                doc[path] = false;
            }

            if (auditFields.member) {
                doc[auditFields.member.path] = restoredBy;
            }

            if (this.updateWithDeleted) {
                return this.updateWithDeleted(conditions, doc, { multi: true }, callback);
            } else {
                return this.update(conditions, doc, { multi: true }, callback);
            }
        };

        if (options.type === Boolean) {
            schema.path(path).validate(function(v, fn){
                return (['boolean', 'undefined'].indexOf(typeof v) >= 0);
            }, getName(path, options) + ' is not a valid boolean delete flag: {VALUE}');
        }

        if (options.type === Date) {
            schema.path(path).validate(function(v, fn){
                return (typeof v === 'undefined' || v instanceof Date);
            }, getName(path, options) + ' is not a valid date delete flag: {VALUE}');
        }
    }
};

function getName (pathName, options) {
    options = options || {};
    return $.strings.isValid(options.name) ? options.name.trim() : pathName;
}

function setOptions (options) {

    var _defaults = {
        hide        : undefined,
        key         : 'audit.deleted',
        index       : true,
        methods     : ['count', 'find', 'findOne', 'findOneAndUpdate', 'update'],
        name        : 'Deleted Date',
        path        : 'ad',
        show        : undefined,
        type        : Date,
        auditType   : 'DELETED'
    };

    var methods;
    if (options.methods === false || (options.methods instanceof Array && options.methods.length < 1)) {
        methods = [];
    } else if (options.methods instanceof Array) {
        methods = $.strings.unique(options.methods).filter(function(m){
            return (_defaults.methods.indexOf(m) >= 0);
        });
    } else {
        methods = _defaults.methods;
    }

    options             = options || {};
    options.hide        = $.numbers.isValidOperation(options.hide) ? options.hide : _defaults.hide;
    options.key         = $.objects.isValidPath(options.key) ? options.key : _defaults.key;
    options.index       = (typeof options.index === 'boolean') ? options.index : _defaults.index;
    options.methods     = methods;
    options.name        = $.objects.ifUndefined(options.name, _defaults.name);
    options.path        = $.objects.isValidKey(options.path) ? options.path : _defaults.path;
    options.show        = $.numbers.isValidOperation(options.show) ? options.show : _defaults.show;
    options.type        = $.objects.ifUndefined(options.type, _defaults.type);
    options.auditType   = _defaults.auditType;
}

/**
 * This code is taken from official mongoose repository
 * https://github.com/Automattic/mongoose/blob/master/lib/query.js#L1996-L2018
 */
/* istanbul ignore next */
function parseUpdateArguments (conditions, doc, options, callback) {
    if ('function' === typeof options) {
        // .update(conditions, doc, callback)
        callback = options;
        options = null;
    } else if ('function' === typeof doc) {
        // .update(doc, callback);
        callback = doc;
        doc = conditions;
        conditions = {};
        options = null;
    } else if ('function' === typeof conditions) {
        // .update(callback)
        callback = conditions;
        conditions = undefined;
        doc = undefined;
        options = undefined;
    } else if (typeof conditions === 'object' && !doc && !options && !callback) {
        // .update(doc)
        doc = conditions;
        conditions = undefined;
        options = undefined;
        callback = undefined;
    }

    var args = [];

    if (conditions) { args.push(conditions); }
    if (doc) { args.push(doc); }
    if (options) { args.push(options); }
    if (callback) { args.push(callback); }

    return args;
}
