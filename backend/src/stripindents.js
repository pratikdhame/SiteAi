"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripIndents = stripIndents;
function stripIndents(arg0) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    if (typeof arg0 !== 'string') {
        var processedString = arg0.reduce(function (acc, curr, i) {
            var _a;
            acc += curr + ((_a = values[i]) !== null && _a !== void 0 ? _a : '');
            return acc;
        }, '');
        return _stripIndents(processedString);
    }
    return _stripIndents(arg0);
}
function _stripIndents(value) {
    return value
        .split('\n')
        .map(function (line) { return line.trim(); })
        .join('\n')
        .trimStart()
        .replace(/[\r\n]$/, '');
}
