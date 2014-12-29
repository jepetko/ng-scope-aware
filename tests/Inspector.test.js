describe('Inspector', function () {

    "use strict";

    var $rootScope, $scope, $compile, Inspector, InspectorHelpers;
    var createCleanScope = function($rootScope) {
        var $scope = $rootScope.$new();

        $scope.alienToken = '12345';
        $scope.alienTokenObj = { token: '6789' };
        $scope.alienFun = function () {
            console.log('>> alienFun');
        };
        return $scope;
    };

    beforeEach(function () {
        module('inspector-test-mocks');
        module('inspector-test-helpers');
        module('scope-aware');
    });

    beforeEach(inject(function (_$rootScope_, _$compile_, _Inspector_, _InspectorHelpers_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        Inspector = _Inspector_;
        InspectorHelpers = _InspectorHelpers_;
    }));

    describe('scopeEmulations', function () {

        var $scope, expectedScopeHierarchy = {};
        beforeEach(function () {
            $scope = createCleanScope($rootScope);
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

        var $scope;
        beforeEach(function() {
            $scope = createCleanScope($rootScope);
        });

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

            InspectorHelpers.testForPresentScopeMembers(expectedScopeHierarchy);

            var unexpectedScopeHierarchy = {};
            unexpectedScopeHierarchy[InspectorHelpers.getScopeId(a)] = ['token', 'tokenobj', 'fun'];
            unexpectedScopeHierarchy[InspectorHelpers.getScopeId(b)] = ['token', 'tokenobj', 'fun'];
            unexpectedScopeHierarchy[InspectorHelpers.getScopeId(c)] = ['alienToken', 'alienTokenObj', 'alienFun', 'token', 'tokenobj', 'fun'];
            unexpectedScopeHierarchy[InspectorHelpers.getScopeId(d)] = ['tokenobj'];
            unexpectedScopeHierarchy[InspectorHelpers.getScopeId(e)] = ['token'];
            unexpectedScopeHierarchy[InspectorHelpers.getScopeId(f)] = ['alienToken', 'alienTokenObj', 'alienFun', 'token', 'tokenobj'];

            InspectorHelpers.testForAbsentScopeMembers(unexpectedScopeHierarchy);
        });

        it('should create proper scopes with transcludes', function () {
            var a = InspectorHelpers.createDirective('directiveSharedScopeWithTransclude', $scope),
                //b = InspectorHelpers.createDirective('directiveSharedScopeExplicitWithTransclude', $scope),
                c = InspectorHelpers.createDirective('directiveIsolatedScopeWithTransclude', $scope);/*
                d = InspectorHelpers.createDirective('directiveIsolatedScopeWithStringWithTransclude', $scope),
                e = InspectorHelpers.createDirective('directiveIsolatedScopeWithObjectWithTransclude', $scope),
                f = InspectorHelpers.createDirective('directiveIsolatedScopeWithFunctionWithTransclude', $scope);*/

            /*console.log(c);
            var s = InspectorHelpers.getScope(c);
            console.log(s);*/

            var expectedScopeHierarchy = {};
            /*expectedScopeHierarchy[InspectorHelpers.getScopeId(a)] = ['alienToken', 'alienTokenObj', 'alienFun'];
            expectedScopeHierarchy[InspectorHelpers.getScopeId(b)] = ['alienToken', 'alienTokenObj', 'alienFun'];
            expectedScopeHierarchy[InspectorHelpers.getScopeId(c)] = [];
            expectedScopeHierarchy[InspectorHelpers.getScopeId(d)] = ['token'];
            expectedScopeHierarchy[InspectorHelpers.getScopeId(e)] = ['tokenobj'];
            expectedScopeHierarchy[InspectorHelpers.getScopeId(f)] = ['fun'];*/

            var result = InspectorHelpers.testForPresentScopeMembers(expectedScopeHierarchy);
            console.log(result);
        });
    });

});