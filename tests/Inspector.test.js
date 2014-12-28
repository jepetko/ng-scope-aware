describe('Inspector', function () {

    "use strict";

    var $rootScope, $scope, $compile, Inspector;

    var getScope = function (element) {
        return element.isolateScope() || element.scope();
    };
    var getScopeId = function (element) {
        return getScope(element).$id;
    };

    var scopeEmulations = (function () {

        var toCamelCase = function (str) {
            if (typeof str === 'undefined') {
                return str;
            }
            var pieces = str.split(/\-/g);
            var result;
            angular.forEach(pieces, function (val) {
                if (typeof result === 'undefined') {
                    result = val.toLowerCase();
                } else {
                    result += val.charAt(0).toUpperCase() + val.slice(1);
                }
            });
            return result;
        };

        var toDashed = function (str) {
            if (typeof str === 'undefined') {
                return str;
            }
            var result = '';
            for (var i = 0; i < str.length; i++) {
                var ch = str.charCodeAt(i);
                if (ch >= 65 && ch <= 90) {
                    result += '-' + str.charAt(i).toLowerCase();
                } else {
                    result += str.charAt(i);
                }
            }
            return result;
        };

        var htmlTemplates = {
            'directiveIsolatedScopeWithString': function () {
                var node = toDashed('directiveIsolatedScopeWithString');
                return '<' + node + ' token="{{alienToken}}"/>';
            },
            'directiveIsolatedScopeWithObject': function () {
                var node = toDashed('directiveIsolatedScopeWithObject');
                return '<' + node + ' tokenobj="alienTokenObj"/>';
            },
            'directiveIsolatedScopeWithFunction': function () {
                var node = toDashed('directiveIsolatedScopeWithFunction');
                return '<' + node + ' fun="alienFun()"/>';
            }
        };

        return {
            directive: function (type, scope) {
                var tpl = htmlTemplates[type] ? htmlTemplates[type]() : '<' + toDashed(type) + '/>';
                var element = $compile(tpl)(scope);
                scope.$digest();

                return element;
            }
        };
    })();

    beforeEach(function () {
        module('scope-utils-mocks');
        module('scope-utils');
    });

    beforeEach(inject(function (_$rootScope_, _$compile_, _Inspector_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();

        $scope.alienToken = '12345';
        $scope.alienTokenObj = { token: '6789' };
        $scope.alienFun = function () {
            console.log('>> alienFun');
        };

        $compile = _$compile_;
        Inspector = _Inspector_;
    }));

    describe('scopeEmulations', function () {

        var expectedScopeHierarchy = {};
        beforeEach(function () {
            expectedScopeHierarchy.directiveSharedScope = ['alienToken', 'alienTokenObj', 'alienFun'];
            expectedScopeHierarchy.directiveSharedScopeExplicit = ['alienToken', 'alienTokenObj', 'alienFun'];
            expectedScopeHierarchy.directiveIsolatedScope = [];
            expectedScopeHierarchy.directiveIsolatedScopeWithString = ['token'];
            expectedScopeHierarchy.directiveIsolatedScopeWithObject = ['tokenobj'];
            expectedScopeHierarchy.directiveIsolatedScopeWithFunction = ['fun'];
        });

        angular.forEach(['directiveSharedScope', 'directiveSharedScopeExplicit', 'directiveIsolatedScope',
            'directiveIsolatedScopeWithString', 'directiveIsolatedScopeWithObject',
            'directiveIsolatedScopeWithFunction'], function (value) {
            it('should create a directive ' + value, (function (val) {

                return function () {
                    var element = scopeEmulations.directive(value, $scope);
                    expect(element).toBeDefined();

                    var keys = Object.keys(element.isolateScope() || element.scope());
                    expectedScopeHierarchy[val].forEach(function (element) {
                        expect(keys).toContain(element);
                    });
                };
            })(value));
        });
    });

    describe('directives', function () {

        it('should create proper scopes', function () {

            var a = scopeEmulations.directive('directiveSharedScope', $scope),
                b = scopeEmulations.directive('directiveSharedScopeExplicit', $scope),
                c = scopeEmulations.directive('directiveIsolatedScope', $scope),
                d = scopeEmulations.directive('directiveIsolatedScopeWithString', $scope),
                e = scopeEmulations.directive('directiveIsolatedScopeWithObject', $scope),
                f = scopeEmulations.directive('directiveIsolatedScopeWithFunction', $scope);

            var expectedScopeHierarchy = {};
            expectedScopeHierarchy[getScopeId(a)] = ['alienToken', 'alienTokenObj', 'alienFun'];
            expectedScopeHierarchy[getScopeId(b)] = ['alienToken', 'alienTokenObj', 'alienFun'];
            expectedScopeHierarchy[getScopeId(c)] = [];
            expectedScopeHierarchy[getScopeId(d)] = ['token'];
            expectedScopeHierarchy[getScopeId(e)] = ['tokenobj'];
            expectedScopeHierarchy[getScopeId(f)] = ['fun'];

            var result = Inspector.inspect(function (id, data) {
                if (!expectedScopeHierarchy[id]) {
                    return;
                }
                var keys = Object.keys(data);
                expectedScopeHierarchy[id].forEach(function (element) {
                    expect(keys).toContain(element);
                });
            });

            console.log(result);
        });

        //TODO: add test for ng-transclude and ng-include
        it('should create proper scopes with transcludes', function () {
            /*
             var nestedDirectives = '<directive-isolated-scope-with-string token="{{alienToken}}">' +
             //Note: nested directives are thrown away because of the missing ng-transclude
             '<directive-isolated-scope-with-object tokenobj="alienTokenObj">' +
             '<directive-isolated-scope-with-function fun="alienFun()">hello</directive-isolated-scope-with-function>' +
             '</directive-isolated-scope-with-object>' +
             '</directive-isolated-scope-with-string>';

             var element = $compile(nestedDirectives)($scope);
             $scope.$digest();

             var result = Inspector.inspect();
             //console.log(result);
             */
        });
    });

});