'use strict';

var Npm = require('npm');
var Package = require('./package');

var COMMANDS = [ 'view', 'info' ];


function permute(str, obj, out) {
    Object.keys(obj).forEach(function (key) {
        var value = obj[key];

        if (typeof value === 'string') {

            out.push(str + key + ' = \'' + value + '\'');

        } else if (Array.isArray(value)) {

            out.push(str + key + ' =');
            value.forEach(function (item) {
                out.push(JSON.stringify(item, null, 4));
            });

        } else {

            permute(str + key + ' ', value, out);

        }
    });
}

exports.register = function (plugin, options, next) {

    plugin.dependency('chivebot', function (plugin, next) {

        plugin.plugins.chivebot.registerCommand('npm', function (raw, args, cb) {
            var cmd;

            cmd = args._[2];

            if (COMMANDS.indexOf(cmd) > -1 && typeof Npm.commands[cmd] === 'function') {

                Npm.commands[cmd](args._.slice(3), function (err, data) {
                    var pkg, lines;

                    if (err) {
                        cb(null, err.message);
                        return;
                    }

                    pkg = args._[3];
                    pkg = pkg.split('@')[0];

                    lines = [];
                    permute(pkg + '@', data, lines);
                    cb(null, lines.join('\n'));
                });

            } else {

                cb(null, '\'' + cmd + '\' is not supported.');
                //Npm.commands.helpSearch([ cmd ], function (err, data) {
                //
                //    if (err) {
                //        cb(null, err.message);
                //        return;
                //    }
                //
                //    if (typeof data === 'string') {
                //        cb(null, data);
                //        return
                //    }
                //
                //    cb(null, JSON.stringify(data));
                //});
            }
        });

        next();
    });

    Npm.load(next);
};


exports.register.attributes = {
    pkg: Package
};