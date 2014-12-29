(function () {
    "use strict";

    angular.module('scope-aware', [])
        .service('Inspector', ['$rootScope', function ($rootScope) {

            var grabScopeMembers = function (anyScope, inheritedProps) {
                var cleanScope = {};
                for (var p in anyScope) {
                    if (p.indexOf('$') === 0 || p === 'this' || p === 'constructor') {
                        continue;
                    }
                    if (!anyScope.hasOwnProperty(p)) {
                        inheritedProps[p] = true;
                    }
                    cleanScope[p] = anyScope[p];
                }
                return cleanScope;
            };

            var traverse = function (anyScope, visitor, lvl) {
                lvl = lvl || 0;
                var i = 0, lvlStr = '', str = '';
                while (i < lvl) {
                    lvlStr += '  ';
                    i++;
                }
                str += lvlStr + '[+]-' + anyScope.$id + '\n';
                var inheritedProps = {};
                var grabbedData = grabScopeMembers(anyScope, inheritedProps);
                if (typeof visitor === 'function') {
                    visitor.apply(null, [anyScope.$id, grabbedData]);
                }
                var data = JSON.stringify(grabbedData,
                    function (key, val) {
                        if (typeof val === 'function') {
                            var fun = val + '';
                            var args = /\(.*\)/g.exec(fun)[0].replace(/^\(/g, '').replace(/\)$/g, '').split(',');
                            return 'function(' + args.join(',') + ') { ... }';
                        }
                        return val;
                    }, '   ');
                var pieces = data.split('\n');
                var formattedData = '';
                angular.forEach(pieces, function (value) {
                    var inherited = /\s*"(\w+)"\s*\:/g.exec(value);
                    var marker = '';
                    if (inherited && inherited[1] && inheritedProps[inherited[1]]) {
                        marker = ' <---- suspect: inherited property';
                    }
                    formattedData += lvlStr + ' |     ' + value + marker + '\n';
                });
                str += formattedData;

                if (typeof anyScope.$$childHead !== 'undefined') {
                    var allChildren = [];
                    var child = anyScope.$$childHead;
                    while (child !== null) {
                        allChildren.push(child);
                        child = child.$$nextSibling;
                    }
                    angular.forEach(allChildren, function (value) {
                        str += traverse(value, visitor, lvl + 1);
                    });
                }
                return str;
            };

            return {
                grabScopeMembers : grabScopeMembers,
                inspect: function (visitor) {
                    return traverse($rootScope, visitor);
                }
            };
        }])
        .service('JasmineMatchersFactory', ['Inspector', function(Inspector) {

            var compareArraysAndTrace = function(id, actual,expected) {
                var missingMembers = [];
                expected.forEach(function(member) {
                    if(actual.indexOf(member) === -1) {
                        missingMembers.push(member);
                    }
                });
                var result = {};
                result.pass = (missingMembers.length === 0);
                if (result.pass) {
                    result.message = 'Scope with ID ' + id + ' has members (' + expected + ')';
                } else {
                    result.message = 'Expected scope with ID ' + id + ' and members [' + actual + '] to have members [' + expected +']. Missing members are: [' + missingMembers + ']';
                }
                return result;
            };

            var toHaveMembers = function(util, customEqualityTesters) {
                return {
                    compare: function(actual, expected) {
                        if (expected === undefined) {
                            expected = '';
                        }
                        if(actual.$id === undefined) {
                            throw new Error('actual should be an angular scope');
                        }
                        var allMembers = Inspector.grabScopeMembers(actual);
                        return compareArraysAndTrace(actual.$id, Object.keys(allMembers), expected);
                    }
                };
            };
            var toHaveInheritedMembers = function(util, customEqualityTesters) {
                return {
                    compare: function(actual, expected) {
                        if (expected === undefined) {
                            expected = '';
                        }
                        if(actual.$id === undefined) {
                            throw new Error('actual should be an angular scope');
                        }
                        var inheritedMembers = {};
                        Inspector.grabScopeMembers(actual, inheritedMembers);
                        return compareArraysAndTrace(actual.$id, Object.keys(inheritedMembers), expected);
                    }
                };
            };
            var toBeCleanScope = function(util, customEqualityTesters) {
                return {
                    compare: function(actual) {
                        var allMembers = Inspector.grabScopeMembers(actual);
                        var result = { pass : true };
                        for(var token in allMembers) {
                            result.pass = false;
                            break;
                        }
                        if (result.pass) {
                            result.message = 'Scope with ID ' + actual.$id + ' is clean';
                        } else {
                            result.message = 'Expected scope with ID ' + actual.$id + ' to be clean';
                        }
                        return result;
                    }
                };
            };
            var toHaveChildScopes = function(util, customEqualityTesters) {
                return {
                    compare: function(actual) {
                        var result = { pass : !!actual.$$childHead };
                        if (result.pass) {
                            result.message = 'Scope with ID ' + actual.$id + ' has at least one child scope';
                        } else {
                            result.message = 'Expected scope with ID ' + actual.$id + ' to have some child scopes';
                        }
                        return result;
                    }
                };
            };
            return {
                create : function() {
                    return {
                        toHaveMembers: toHaveMembers,
                        toHaveInheritedMembers: toHaveInheritedMembers,
                        toBeCleanScope: toBeCleanScope,
                        toHaveChildScopes: toHaveChildScopes
                    };
                }
            };
        }]);

    if(jasmine && typeof beforeEach === 'function') {
        var $injector = angular.bootstrap(window, ['scope-aware']);
        var JasmineMatchersFactory = $injector.get('JasmineMatchersFactory');
        var matchers = JasmineMatchersFactory.create();
        beforeEach(function() {
            jasmine.addMatchers(matchers);
        });
    }
})();