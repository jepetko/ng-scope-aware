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
                    expect(element.isolateScope() || element.scope()).toHaveMembers(expectedScopeHierarchy[val]);
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

            expect(InspectorHelpers.getScope(a)).toHaveMembers('alienToken', 'alienTokenObj', 'alienFun');
            expect(InspectorHelpers.getScope(b)).toHaveMembers('alienToken', 'alienTokenObj', 'alienFun');
            expect(InspectorHelpers.getScope(c)).toBeCleanScope();
            expect(InspectorHelpers.getScope(d)).toHaveMembers('token');
            expect(InspectorHelpers.getScope(e)).toHaveMembers('tokenobj');
            expect(InspectorHelpers.getScope(f)).toHaveMembers('fun');

            expect(InspectorHelpers.getScope(a)).not.toHaveMembers('token', 'tokenobj', 'fun');
            expect(InspectorHelpers.getScope(b)).not.toHaveMembers('token', 'tokenobj', 'fun');
            expect(InspectorHelpers.getScope(c)).not.toHaveMembers('alienToken', 'alienTokenObj', 'alienFun', 'token', 'tokenobj', 'fun');
            expect(InspectorHelpers.getScope(d)).not.toHaveMembers('tokenobj');
            expect(InspectorHelpers.getScope(e)).not.toHaveMembers('token');
            expect(InspectorHelpers.getScope(f)).not.toHaveMembers('alienToken', 'alienTokenObj', 'alienFun', 'token', 'tokenobj');
        });

        it('should create proper scopes with transcludes', function () {
            var a = InspectorHelpers.createDirective('directiveSharedScopeWithTransclude', $scope),
                b = InspectorHelpers.createDirective('directiveSharedScopeExplicitWithTransclude', $scope),
                c = InspectorHelpers.createDirective('directiveIsolatedScopeWithTransclude', $scope),
                d = InspectorHelpers.createDirective('directiveIsolatedScopeWithStringWithTransclude', $scope),
                e = InspectorHelpers.createDirective('directiveIsolatedScopeWithObjectWithTransclude', $scope),
                f = InspectorHelpers.createDirective('directiveIsolatedScopeWithFunctionWithTransclude', $scope);

            var result = Inspector.inspect();
            expect(InspectorHelpers.getScope(a)).toHaveChildScopes();
            expect(InspectorHelpers.getScope(a)).toHaveMembers('alienToken','alienTokenObj','alienFun');
            //scope created by ng-transclude
            expect(InspectorHelpers.getScope(a).$$childHead).toHaveInheritedMembers('alienToken','alienTokenObj','alienFun');
            expect(InspectorHelpers.getScope(a).$$childHead).toPossiblyShadow('alienToken');

            expect(InspectorHelpers.getScope(b)).toHaveChildScopes();
            expect(InspectorHelpers.getScope(b)).toHaveMembers('alienToken','alienTokenObj','alienFun');
            expect(InspectorHelpers.getScope(b).$$childHead).toHaveInheritedMembers('alienToken','alienTokenObj','alienFun');

            expect(InspectorHelpers.getScope(c)).toHaveChildScopes();
            expect(InspectorHelpers.getScope(c)).toBeCleanScope();
            expect(InspectorHelpers.getScope(c).$$childHead).toHaveInheritedMembers('alienToken','alienTokenObj','alienFun');

            expect(InspectorHelpers.getScope(d)).toHaveChildScopes();
            expect(InspectorHelpers.getScope(d)).toHaveMembers('token');
            expect(InspectorHelpers.getScope(d).$$childHead).toHaveInheritedMembers('alienToken','alienTokenObj','alienFun');

            expect(InspectorHelpers.getScope(e)).toHaveChildScopes();
            expect(InspectorHelpers.getScope(e)).toHaveMembers('tokenobj');
            expect(InspectorHelpers.getScope(e).$$childHead).toHaveInheritedMembers('alienToken','alienTokenObj','alienFun');

            expect(InspectorHelpers.getScope(f)).toHaveChildScopes();
            expect(InspectorHelpers.getScope(f)).toHaveMembers('fun');
            expect(InspectorHelpers.getScope(f).$$childHead).toHaveInheritedMembers('alienToken','alienTokenObj','alienFun');
        });

        describe('ng-repeat', function() {

            var scope, scopeTranscluded;
            beforeEach(function() {
                $scope.alienArr = ['A', 'B', 'C'];
                var a = InspectorHelpers.createDirective('directiveSharedScopeWithTransclude', $scope, '<ul><li ng-repeat="el in alienArr">{{el}}</li></ul>');
                scope = InspectorHelpers.getScope(a);
                scopeTranscluded = scope.$$childHead;
            });

            it('creates 3 scopes because alienArr contains 3 elements', function() {
                expect(scope).toHaveChildScopes();
                expect(scopeTranscluded).toHaveChildScopes();
                var count = 0;
                var result = Inspector.inspect(scope.$$childHead, function(id,data) {
                    if(id === scopeTranscluded.$id) {
                        return;
                    }
                    count++;
                });
                console.log(result);
                expect(count).toBe(3);
            });

            it('should possibly shadow property of the parent scope', function() {
                var firstRepeatScope = scope.$$childHead.$$childHead;
                expect(firstRepeatScope).toPossiblyShadow('alienToken');
            });

            it('shout shadow properties of the parent scope when the property is set', function() {
                var firstRepeatScope = scope.$$childHead.$$childHead;
                expect(firstRepeatScope).not.toShadow('alienToken');
                firstRepeatScope.alienToken = 'Overridden';
                expect(firstRepeatScope).toShadow('alienToken');
            });
        });
    });

});