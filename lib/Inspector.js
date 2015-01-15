(function () {
    "use strict";

    angular.module('scope-aware', [])
        .service('Inspector', ['$rootScope', function ($rootScope) {

            var grabElement = function(id, element) {
                var el = angular.element(element);
                var scope = el.isolateScope() || el.scope();
                if(scope && scope.$id === id) {
                    return el;
                } else {
                    for(var i=0;i<element.childNodes.length; i++) {
                        var subEl = grabElement(id, element.childNodes[i]);
                        if(typeof subEl !== 'undefined') {
                            return subEl;
                        }
                    }
                }
            };

            var guessAngularDir = function(element) {
                if(element) {
                    var possibleDir = ['ng-repeat', 'ng-include', 'ng-transclude'];
                    for(var i=0;i<possibleDir.length;i++) {
                        if(element.attr(possibleDir[i])) {
                            return possibleDir[i];
                        }
                    }
                }
            };

            var grabScopeMembers = function (anyScope, inheritedProps, onlyPrimitives) {
                var cleanScope = {};
                for (var p in anyScope) {
                    if (p.indexOf('$') === 0 || p === 'this' || p === 'constructor') {
                        continue;
                    }
                    if(typeof inheritedProps !== 'undefined') {
                        if (!anyScope.hasOwnProperty(p)) {
                            var doAdd = true;
                            if (onlyPrimitives === true) {
                                doAdd = !(angular.isObject(anyScope[p]) || angular.isFunction(anyScope[p]));
                            }
                            if (doAdd === true) {
                                inheritedProps[p] = true;
                            }
                        }
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
                var element = grabElement(anyScope.$id, document.body);
                var dir = guessAngularDir(element);
                var info = (element && element.length > 0) ? ' <' + element[0].nodeName + '>' + (dir ? ' ' + dir : '') : '';
                str += lvlStr + '[+]-' + anyScope.$id + info + '\n';
                var inheritedProps = {};
                var grabbedData = grabScopeMembers(anyScope, inheritedProps);
                if (typeof visitor === 'function') {
                    visitor.apply(null, [anyScope.$id, grabbedData]);
                }
                var data = JSON.stringify(grabbedData,
                    function (key, val) {
                        //skip angular properties
                        if(key.indexOf && key.indexOf('$') === 0) {
                            return undefined;
                        }
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
                grabElement: grabElement,
                guessAngularDir: guessAngularDir,
                inspect: function (scope, visitor) {
                    return traverse(scope || $rootScope, visitor);
                }
            };
        }])
        .service('MiniTemplateEngine', [ function() {
            return {
                fill: function(tpl) {
                    var values = Array.prototype.slice.call(arguments);
                    var rep = tpl.replace(/\{\{[1-9]+\}\}/g, function(m, offset, str) {
                        var idx = parseInt(m.replace(/\{/g,'').replace(/\}/g,''),10);
                        var val = values[idx];
                        return val;
                    });
                    return rep;
                }
            };
        }])
        .service('JasmineMatchersFactory', ['Inspector', 'MiniTemplateEngine', function(Inspector, MiniTemplateEngine) {

            var checkScope = function(scope) {
                if(!scope) {
                    throw new Error('scope should be an object');
                }
                if(!scope.$id) {
                    throw new Error('actual should be an angular scope');
                }
            };
            var compareArraysAndTrace = function(id, actual, expected, msgPass, msgFail) {
                var missingMembers = [];
                expected.forEach(function(member) {
                    if(actual.indexOf(member) === -1) {
                        missingMembers.push(member);
                    }
                });
                var result = {};
                result.pass = (missingMembers.length === 0);
                if (result.pass) {
                    result.message = MiniTemplateEngine.fill(msgPass, id, expected);
                } else {
                    result.message = MiniTemplateEngine.fill(msgFail, id, actual, expected, missingMembers);
                }
                return result;
            };

            var toHaveMembers = function(util, customEqualityTesters) {
                return {
                    compare: function(actual, expected) {
                        checkScope(actual);
                        var allMembers = Inspector.grabScopeMembers(actual);
                        var msgPass = 'Scope with ID {{1}} has members ({{2}})';
                        var msgFail = 'Expected scope with ID {{1}} and members [{{2}}] to have members [{{3}}]. Missing members are: [{{4}}]';
                        return compareArraysAndTrace(actual.$id, Object.keys(allMembers), expected, msgPass, msgFail);
                    }
                };
            };
            var toHaveInheritedMembers = function(util, customEqualityTesters) {
                return {
                    compare: function(actual, expected) {
                        checkScope(actual);
                        var inheritedMembers = {};
                        Inspector.grabScopeMembers(actual, inheritedMembers);
                        var msgPass = 'Scope with ID {{1}} has inherited members ({{2}})';
                        var msgFail = 'Expected scope with ID {{1}} and inherited members [{{2}}] to have inherited members [{{3}}]. Missing members are: [{{4}}]';
                        return compareArraysAndTrace(actual.$id, Object.keys(inheritedMembers), expected, msgPass, msgFail);
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
            var toPossiblyShadow = function(util, customEqualityTesters) {
                return {
                    compare: function(actual, expected) {
                        checkScope(actual);
                        var inheritedMembers = {};
                        //only primitives can be shadowed ==> pass true
                        Inspector.grabScopeMembers(actual, inheritedMembers, true);
                        var msgPass = 'Scope with ID {{1}} can possibly shadow inherited properties ({{2}})';
                        var msgFail = 'Expected scope with ID {{1}} and inherited members [{{2}}] to possibly shadow members [{{3}}]. Missing members are: [{{4}}]';
                        return compareArraysAndTrace(actual.$id, Object.keys(inheritedMembers), expected, msgPass, msgFail);
                    }
                };
            };
            var toShadow = function(util, customEqualityTesters) {
                return {
                    compare: function(actual, expected) {
                        checkScope(actual);
                        var hasOwnPropInScopeChain = function(scope,prop) {
                            if(scope === null) {
                                return false;
                            }
                            if(scope.hasOwnProperty(prop)) {
                                return !(angular.isObject(scope[prop]) || angular.isFunction(scope[prop]));
                            } else {
                                return hasOwnPropInScopeChain.call(null,scope.$parent,prop);
                            }
                        };

                        var shadowed = [];
                        expected.forEach(function(member) {
                            if(actual.hasOwnProperty(member) && hasOwnPropInScopeChain(actual.$parent,member) === true) {
                                shadowed.push(member);
                            }
                        });
                        var msgPass = 'Scope with ID {{1}} is shadowing inherited properties ({{2}})';
                        var msgFail = 'Expected scope with ID {{1}} and inherited members [{{2}}] to shadow members [{{3}}]. Missing members are: [{{4}}]';
                        return compareArraysAndTrace(actual.$id, shadowed, expected, msgPass, msgFail);
                    }
                };
            };
            return {
                create : function() {
                    return {
                        toHaveMembers: toHaveMembers,
                        toHaveInheritedMembers: toHaveInheritedMembers,
                        toBeCleanScope: toBeCleanScope,
                        toHaveChildScopes: toHaveChildScopes,
                        toPossiblyShadow: toPossiblyShadow,
                        toShadow: toShadow
                    };
                }
            };
        }]);

    if(typeof jasmine != 'undefined' && typeof beforeEach === 'function') {
        var $injector = angular.bootstrap(window, ['scope-aware']);
        var JasmineMatchersFactory = $injector.get('JasmineMatchersFactory');
        var matchers = JasmineMatchersFactory.create();
        beforeEach(function() {
            jasmine.addMatchers(matchers);
        });
    }
})();