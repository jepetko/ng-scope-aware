describe('Inspector abilities for ngController scope problems', function () {

    "use strict";

    var $rootScope, $scope, $compile, Inspector;

    beforeEach(function () {
        module('inspector-test-helpers');
        module('scope-aware');
    });

    beforeEach(inject(function (_$rootScope_, _$compile_, _Inspector_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        Inspector = _Inspector_;
        $scope = $rootScope.$new();
    }));

    describe('usage of primitives', function () {

        var element;
        beforeEach(function() {
            var tpl = '<div>' +
                        '<div ng-controller="Ctrl" ng-init="primitive=\'a\'">' +
                            '<span>{{primitive}}</span>' +
                            '<div ng-controller="SubCtrl">' +
                                '<input ng-model="primitive">' +
                            '</div>' +
                        '</div>' +
                    '</div>';
            element = $compile(tpl)($scope);
            angular.element(document.body).append(element);
            $rootScope.$digest();
        });

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("doesn't change the original value",function() {

            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();
            var spanScope = angular.element(element.find('span')[0]).scope();

            //scopes are different
            expect(scope).not.toBe($scope);
            expect(scope.$parent).toBe(spanScope);

            //the value of primitive in Ctrl (spanScope) and $scope is still 'a' because a primitive is used
            expect(scope.primitive).toBe('AAA');
            expect(spanScope.primitive).toBe('a');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('primitive');
            expect(scope).not.toHaveInheritedMembers('primitive');
            expect(scope).toShadow('primitive');
        });
    });

    describe('usage of objects', function () {

        var element;
        beforeEach(function() {
            var tpl = '<div>' +
                        '<div ng-controller="Ctrl" ng-init="obj.key=\'a\'">' +
                            '<span>{{primitive}}</span>' +
                            '<div ng-controller="SubCtrl">' +
                                '<input ng-model="obj.key">' +
                            '</div>' +
                        '</div>' +
                    '</div>';
            element = $compile(tpl)($scope);
            angular.element(document.body).append(element);
            $rootScope.$digest();
        });

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("changes the original value",function() {
            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();
            var spanScope = angular.element(element.find('span')[0]).scope();

            //scopes are different
            expect(scope).not.toBe($scope);
            expect(scope.$parent).toBe(spanScope);

            //the value in the parent scope is changed as well
            expect(scope.obj.key).toBe('AAA');
            expect(spanScope.obj.key).toBe('AAA');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers('obj');
            expect(scope).toHaveInheritedMembers('obj');
            expect(scope).not.toShadow('obj');
        });
    });
});