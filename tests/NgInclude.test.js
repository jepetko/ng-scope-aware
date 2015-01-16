describe('Inspector abilities for ngInclude scope problems', function () {

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

        var $scope, el, element, Ctrl;
        beforeEach((inject(function ($controller, $templateCache) {

            $templateCache.put('tpl', '<div><input ng-model="primitive"></div>');
            $scope = $rootScope.$new();
            Ctrl = $controller('Ctrl', {
                '$scope' : $scope
            });
            $scope.primitive = 'a';

            var tpl = "<div><div ng-include=\" 'tpl' \"></div></div>";
            el = angular.element(tpl);
            element = $compile(el)($scope);
            $scope.$digest();
        })));

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("doesnt change the original value",function() {
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
            expect(scope).toHaveMembers(['primitive']);
            expect(scope).not.toHaveInheritedMembers(['primitive']);
            expect(scope).toShadow(['primitive']);
        });
    });

    describe('usage of objects', function () {

        var $scope, el, element, Ctrl;
        beforeEach((inject(function ($controller, $templateCache) {
            $templateCache.put('tpl', '<div><input ng-model="primitive.key"></div>');
            $scope = $rootScope.$new();
            Ctrl = $controller('Ctrl', {
                '$scope' : $scope
            });
            $scope.primitive = { key : 'a' };

            var tpl = "<div><div ng-include=\" 'tpl' \"></div></div>";
            el = angular.element(tpl);
            element = $compile(el)($scope);
            $scope.$digest();
        })));

        afterEach(function() {
            console.log(Inspector.inspect($scope));
        });

        it("doesnt change the original value",function() {
            var input = element.find('input')[0];
            var scope = angular.element(input).scope();
            angular.element(input).val('AAA').triggerHandler('input');
            $scope.$digest();

            //scopes are different
            expect(scope).not.toBe($scope);
            expect(scope.$parent).toBe($scope);

            //the value in the parent scope is changed as well
            expect(scope.primitive.key).toBe('AAA');
            expect($scope.primitive.key).toBe('AAA');

            //additional tests (ng-scope-aware)
            expect(scope).toHaveMembers(['primitive']);
            expect(scope).toHaveInheritedMembers(['primitive']);
            expect(scope).not.toShadow(['primitive']);
        });
    });
});