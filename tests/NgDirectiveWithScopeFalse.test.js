describe('Inspector abilities for ngDirective({scope:false}) scope problems', function () {

    "use strict";

    var $rootScope, $scope, $compile, Inspector, InspectorHelpers, element;

    beforeEach(function () {
        module('inspector-test-helpers');
        module('scope-aware');
    });

    beforeEach(inject(function (_$rootScope_, _$compile_, _Inspector_, _InspectorHelpers_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        Inspector = _Inspector_;
        InspectorHelpers = _InspectorHelpers_;

        $scope = $rootScope.$new();
        $scope.token = 'a';
        element = InspectorHelpers.createDirective('directiveSharedScope', $scope);
    }));

    afterEach(function() {
        console.log(Inspector.inspect($scope));
    });

    it("doesn't create own scope",function() {

        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        expect(scope).toBe($scope);
    });

    it("clobbers the shared properties", function () {
        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

        //the value of token is 'AAA' because the directive has overridden the value in the shared scope
        expect(scope.token).toBe($scope.token);
        expect($scope.token).toBe('AAA');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('token');
        expect(scope).not.toHaveInheritedMembers('token');  //because the is no inheritance at all
        expect(scope).not.toShadow('token');
    });
});