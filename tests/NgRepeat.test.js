describe('Inspector abilities for ngRepeat scope problems', function () {

    "use strict";

    var $rootScope, $compile, Inspector;

    beforeEach(function () {
        module('inspector-test-helpers');
        module('scope-aware');
    });

    beforeEach(inject(function (_$rootScope_, _$compile_, _Inspector_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        Inspector = _Inspector_;
    }));

    describe('usage of primitives', function () {

        var $scope, el, element;
        beforeEach(function () {
            $scope = $rootScope.$new();
            $scope.val = 'X';
            $scope.values = ['a', 'b', 'c'];

            var tpl = '<ul><li ng-repeat="val in values"><input type="text" ng-model="val"><p>{{val}}</p></li></ul>';
            el = angular.element(tpl);
            element = $compile(el)($scope);
            $scope.$digest();
        });

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("doesn't change the original value",function() {
            var input = el.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();

            //scopes are different
            expect(scope).not.toBe($scope);
            expect(scope.$parent).toBe($scope);

            //the value in the parent scope is still 'a' because primitives are used
            expect(scope.val).toBe('AAA');
            expect($scope.values[0]).toBe('a');
            expect($scope.val).toBe('X');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('val');
            expect(scope).not.toHaveInheritedMembers('val');
            expect(scope).toHaveInheritedMembers('values');
            expect(scope).toShadow('val');
        });
    });

    describe('usage of objects', function () {
        var $scope, el, element;
        beforeEach(function () {
            $scope = $rootScope.$new();
            $scope.val = {};
            $scope.values = [{key: 'a'}, {key: 'b'}, {key: 'c'}];

            var tpl = '<ul><li ng-repeat="val in values"><input type="text" ng-model="val.key"><p>{{key}}</p></li></ul>';
            el = angular.element(tpl);
            element = $compile(el)($scope);
            angular.element(document.body).append(element);
            $scope.$digest();
        });
        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("changes the original value",function() {
            var input = el.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();

            //scopes are still different
            expect(scope).not.toBe($scope);
            expect(scope.$parent).toBe($scope);

            //the value in the parent scope is 'AAA'
            expect(scope.val.key).toBe('AAA');
            expect($scope.values[0]).toEqual(jasmine.objectContaining({key: 'AAA'}));
            expect($scope.val).toEqual({});

            //additional tests (ng-scope-aware)
            //.. creates an own member 'val'
            expect(scope).toHaveMembers('val');
            //.. inherits 'values' but not 'val'
            expect(scope).toHaveInheritedMembers('values');
            expect(scope).not.toHaveInheritedMembers('val');
            expect(scope).not.toShadow('val');
        });
    });
});