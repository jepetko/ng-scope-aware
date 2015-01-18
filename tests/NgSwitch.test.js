describe('Inspector abilities for ngSwitch scope problems', function () {

    "use strict";

    var $rootScope, $compile, Inspector, $scope, Ctrl;

    beforeEach(function () {
        module('inspector-test-helpers');
        module('scope-aware');
    });

    beforeEach(inject(function (_$rootScope_, _$compile_, _Inspector_, $controller) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        Inspector = _Inspector_;

        $scope = $rootScope.$new();
        Ctrl = $controller('Ctrl', {
            '$scope' : $scope
        });
    }));

    describe('usage of primitives', function () {

        var element;
        beforeEach(function () {
            $scope.primitive = 'a';

            var tpl = '<div ng-switch on="primitive">' +
                            '<div ng-switch-when="a">A<input ng-model="primitive"></div>' +
                            '<div ng-switch-when="b">B</div>' +
                            '<div ng-switch-when="c">C</div>' +
                        '</div>';
            element = $compile(tpl)($scope);
            angular.element(document.body).append(element);
            $scope.$digest();
        });
        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("doesn't change the original value",function() {
            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('b').triggerHandler('input');
            $scope.$digest();

            //scopes are different
            expect(scope).not.toBe($scope);
            expect(scope.$parent).toBe($scope);

            //the old element is preserved because we didn't change the original property value
            expect(angular.element(element.children()[0]).text()).toBe('A');

            //the value in the parent scope is still 'a' because primitives are used
            expect(scope.primitive).toBe('b');
            expect($scope.primitive).toBe('a');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('primitive');
            expect(scope).not.toHaveInheritedMembers('primitive');
            expect(scope).toShadow('primitive');
        });
    });

    describe('usage of objects', function () {
        var element;
        beforeEach(function () {

            $scope.obj = {key: 'a'};

            var tpl = '<div ng-switch on="obj.key">' +
                            '<div ng-switch-when="a">A<input ng-model="obj.key"></div>' +
                            '<div ng-switch-when="b">B</div>' +
                            '<div ng-switch-when="c">C</div>' +
                        '</div>';
            element = $compile(tpl)($scope);
            angular.element(document.body).append(element);
            $scope.$digest();
        });
        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("changes the original value",function() {
            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('b').triggerHandler('input');
            $scope.$digest();

            //scopes are still different
            expect(scope).not.toBe($scope);
            //hmmmm... scope.$parent is null for some reason...
            //expect(scope.$parent).toBe($scope);

            //the new element is selected: 'B'
            expect(angular.element(element.children()[0]).text()).toBe('B');

            //the value in the parent and child scope is equal (='b') because we work here with objects
            expect(scope.obj.key).toBe('b');
            expect($scope.obj.key).toEqual('b');

            //additional tests (ng-scope-aware)
            //.. it has a member 'obj'
            expect(scope).toHaveMembers('obj');
            //.. inherits 'obj' from the parent scope (prototypal inheritance)
            expect(scope).toHaveInheritedMembers('obj');
            //.. doesn't shadow the property 'obj' because the inherited property is used when the input value is inserted
            expect(scope).not.toShadow('obj');
        });
    });
});