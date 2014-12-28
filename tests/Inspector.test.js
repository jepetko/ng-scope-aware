describe('Inspector', function () {

    "use strict";

    var $rootScope, $scope, $compile, Inspector, InspectorHelpers;

    beforeEach(function () {
        module('inspector-test-mocks');
        module('inspector-test-helpers');
        module('scope-aware');
    });

    beforeEach(inject(function (_$rootScope_, _$compile_, _Inspector_, _InspectorHelpers_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();

        $scope.alienToken = '12345';
        $scope.alienTokenObj = { token: '6789' };
        $scope.alienFun = function () {
            console.log('>> alienFun');
        };

        $compile = _$compile_;
        Inspector = _Inspector_;
        InspectorHelpers = _InspectorHelpers_;
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
                    var element = InspectorHelpers.createDirective(value, $scope);
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

            var a = InspectorHelpers.createDirective('directiveSharedScope', $scope),
                b = InspectorHelpers.createDirective('directiveSharedScopeExplicit', $scope),
                c = InspectorHelpers.createDirective('directiveIsolatedScope', $scope),
                d = InspectorHelpers.createDirective('directiveIsolatedScopeWithString', $scope),
                e = InspectorHelpers.createDirective('directiveIsolatedScopeWithObject', $scope),
                f = InspectorHelpers.createDirective('directiveIsolatedScopeWithFunction', $scope);

            var expectedScopeHierarchy = {};
            expectedScopeHierarchy[InspectorHelpers.getScopeId(a)] = ['alienToken', 'alienTokenObj', 'alienFun'];
            expectedScopeHierarchy[InspectorHelpers.getScopeId(b)] = ['alienToken', 'alienTokenObj', 'alienFun'];
            expectedScopeHierarchy[InspectorHelpers.getScopeId(c)] = [];
            expectedScopeHierarchy[InspectorHelpers.getScopeId(d)] = ['token'];
            expectedScopeHierarchy[InspectorHelpers.getScopeId(e)] = ['tokenobj'];
            expectedScopeHierarchy[InspectorHelpers.getScopeId(f)] = ['fun'];

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