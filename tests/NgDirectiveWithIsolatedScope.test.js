describe('Inspector abilities for ngDirective({scope:{...}}) scope behavior', function () {

    "use strict";

    var $rootScope, Inspector, InspectorHelpers;

    beforeEach(function () {
        module('inspector-test-helpers');
        module('scope-aware');
    });

    beforeEach(inject(function (_$rootScope_, _Inspector_, _InspectorHelpers_) {
        $rootScope = _$rootScope_;
        Inspector = _Inspector_;
        InspectorHelpers = _InspectorHelpers_;
    }));

    describe('when primitives are used', function() {

        var $scope, element;
        beforeEach(function() {
            $scope = $rootScope.$new();
            $scope.token = 'a';
            element = InspectorHelpers.createDirective('directiveIsolatedScopeWithString', $scope);
        });

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("doesn't shadow primitives because isolated scope is used", function () {
            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();

            //it creates its own scope
            expect(scope).not.toBe($scope);
            expect(scope.$parent).toBe($scope);

            //the value of token in the parent scope is still 'a' because there token is referenced by '@' (string)
            expect(scope.token).toBe('AAA');
            expect($scope.token).toBe('a');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('token');
            expect(scope).not.toHaveInheritedMembers('token');
            expect(scope).not.toShadow('token');
        });
    });

    describe('when objects are used', function() {

        var $scope, element;
        beforeEach(function() {
            $scope = $rootScope.$new();
            $scope.alienTokenObj = { token : 'a' };

            //<directive-isolated-scope-with-object tokenobj="alienTokenObj"></directive-isolated-scope-with-object>
            element = InspectorHelpers.createDirective('directiveIsolatedScopeWithObject', $scope);
        });

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("doesn't shadow objects because isolated scope is used", function () {
            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();

            //the value of token in the parent scope is 'AAA' because object is used (= operator for isolated scope)
            expect(scope.tokenobj.token).toBe('AAA');
            expect($scope.alienTokenObj.token).toBe('AAA');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('tokenobj');
            //there is no prototypal inheritance at all
            expect(scope).not.toHaveInheritedMembers('tokenobj');
            expect(scope).not.toHaveInheritedMembers('alienTokenObj');
            //there is no shadowing
            expect(scope).not.toShadow('tokenobj');
            expect(scope).not.toShadow('alienTokenObj');
        });
    });
});