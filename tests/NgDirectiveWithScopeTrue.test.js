describe('Inspector abilities for ngDirective({scope:true}) scope problems', function () {

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
            element = InspectorHelpers.createDirective('directiveSharedScopeExplicitTrue', $scope);
        });

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("shadows primitive properties", function () {
            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();

            //it creates its own scope
            expect(scope).not.toBe($scope);
            expect(scope.$parent).toBe($scope);

            //the value of token in the paren scope is still 'a' because the property has been shadowed
            expect(scope.token).toBe('AAA');
            expect($scope.token).toBe('a');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('token');
            expect(scope).not.toHaveInheritedMembers('token');
            expect(scope).toShadow('token');
        });
    });

    describe('when objects are used', function() {

        var $scope, element;
        beforeEach(function() {
            $scope = $rootScope.$new();
            $scope.tokenobj = { token : 'a' };
            element = InspectorHelpers.createDirective('directiveSharedScopeExplicitTrueWithObject', $scope);
        });

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("inherits objects and doesn't shadow them", function () {
            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();

            //the value of token in the parent scope is 'AAA' because object is used
            expect(scope.tokenobj.token).toBe('AAA');
            expect($scope.tokenobj.token).toBe('AAA');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('tokenobj');
            expect(scope).toHaveInheritedMembers('tokenobj');
            expect(scope).not.toShadow('token');
        });
    });
});