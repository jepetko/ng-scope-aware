describe('Inspector abilities for ngView scope problems', function () {

    "use strict";

    var $rootScope, $scope, $compile, Inspector, Ctrl, element;

    var createNgView = function() {
        var tpl = '<div><div ng-view></div></div>';
        var element = $compile(tpl)($scope);
        angular.element(document.body).append(element);
        $rootScope.$digest();
        return element;
    };

    beforeEach(function () {
        module('inspector-test-helpers');
        module('scope-aware');
    });

    beforeEach(inject(function (_$rootScope_, _$compile_, $controller, _Inspector_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        Inspector = _Inspector_;

        $scope = $rootScope.$new();
        Ctrl = $controller('Ctrl', {
            '$scope' : $scope
        });
        element = createNgView();
    }));

    describe('usage of primitives', function () {

        beforeEach(inject(function($location) {
            $scope.primitive = 'a';

            $location.path('/primitive');
            $rootScope.$digest();
        }));

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("doesn't change the original value",function() {

            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();

            //scopes are different
            expect(scope).not.toBe($scope);
            expect(scope.$parent).toBe($scope);

            //the value in the parent scope is still 'a' because primitives are used
            expect(scope.primitive).toBe('AAA');
            expect($scope.primitive).toBe('a');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('primitive');
            expect(scope).not.toHaveInheritedMembers('primitive');
            expect(scope).toShadow('primitive');
        });
    });

    describe('usage of objects', function () {

        beforeEach(inject(function ($location) {
            $scope.obj = { key : 'a' };

            $location.path('/object');
            $rootScope.$digest();
        }));

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("changes the original value",function() {
            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();

            //scopes are different
            expect(scope).not.toBe($scope);
            expect(scope.$parent).toBe($scope);

            //the value in the parent scope is changed as well
            expect(scope.obj.key).toBe('AAA');
            expect($scope.obj.key).toBe('AAA');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('obj');
            expect(scope).toHaveInheritedMembers('obj');
            expect(scope).not.toShadow('obj');
        });
    });
});