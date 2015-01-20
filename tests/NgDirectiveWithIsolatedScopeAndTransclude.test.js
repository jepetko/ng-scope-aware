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
        beforeEach(inject(function($compile) {
            $scope = $rootScope.$new();
            $scope.token = 'token';
            $scope.alienToken = 'alienToken';
            $scope.alienTokenObj = {token : 'token_value'};
            element = InspectorHelpers.createDirective('directiveIsolatedScopeWithPrimitiveAndObjectWithTransclude', $scope);
        }));

        afterEach(function() {
            console.log('**************');
            console.log(Inspector.inspect($scope));
        });

        it("doesn't shadow primitives because isolated scope is used", function () {
            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();

            //Note: transclude will create a new child scope which is child of the isolate scope
            //TODO: copy it from angular JS page
            expect(scope.$parent.$parent).toBe($scope);

            //the value of token in the parent scope is still 'a' because there token is referenced by '@' (string)
            // and therefore not changed in the child scope
            expect(scope.token).toBe('AAA');
            expect($scope.token).toBe('token');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('token', 'alienToken', 'alienTokenObj');
            //token is not inherited because it's shadowed
            expect(scope).toHaveInheritedMembers('alienToken', 'alienTokenObj');
            expect(scope).toShadow('token');
        });
    });

    describe('when objects are used', function() {

        var $scope, element;
        beforeEach(function() {
            $scope = $rootScope.$new();
            $scope.token = 'token';
            $scope.tokenObj = {token : 'from_token_obj'};
            $scope.alienToken = 'alienToken';
            $scope.alienTokenObj = {token : 'from_alien_token_obj'};
            element = InspectorHelpers.createDirective('directiveIsolatedScopeWithPrimitiveAndObjectWithTransclude', $scope);
        });

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("doesn't shadow objects because isolated scope is used", function () {
            var input = element.find('input')[1];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();

            //Note: transclude will create a new child scope which is child of the isolate scope
            //
            //From guide: https://docs.angularjs.org/api/ng/service/$compile
            // "When you call a transclude function it returns a DOM fragment that is pre-bound to a transclusion scope.
            // This scope is special, in that it is a child of the directive's scope (and so gets destroyed when the directive's
            // scope gets destroyed) but it inherits the properties of the scope from which it was taken."
            expect(scope.$parent.$parent).toBe($scope);

            //the value of token in the parent scope is 'AAA' because object is used (= operator for isolated scope)
            expect(scope.tokenObj.token).toBe('AAA');
            expect($scope.tokenObj.token).toBe('AAA');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('token', 'tokenObj', 'alienToken', 'alienTokenObj');
            expect(scope).toHaveInheritedMembers('token', 'tokenObj', 'alienToken', 'alienTokenObj');
            //there is no shadowing
            expect(scope).not.toShadow('token');
            expect(scope).not.toShadow('tokenObj');
        });
    });
});