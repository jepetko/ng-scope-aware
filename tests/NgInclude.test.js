describe('Inspector abilities for ngInclude scope problems', function () {

    "use strict";

    var $rootScope, $compile, Inspector;

    beforeEach(function () {
        module('inspector-test-helpers');
        module('scope-aware');
    });

    beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_, _Inspector_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        Inspector = _Inspector_;
        _$templateCache_.put('tpl', '<div><input ng-model="primitive"></div>');
    }));

    describe('usage of primitives', function () {

        var $scope, el, element, Ctrl;
        beforeEach((inject(function ($controller, $templateCache) {

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

    /*
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

        it("doesnt change the original value",function() {
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

            //additional tests (ng-scope-aware)
            //.. creates an own member 'val'
            expect(scope).toHaveMembers(['val']);
            //.. inherits 'values' but not 'val'
            expect(scope).toHaveInheritedMembers(['values']);
            //NOTE: the test not.toShadow(['val']) doesn't make any sense
            //because ng-repeat behaves independently no matter whether val is Object or a primitive
            //this works as designed.
        });
    });*/
});