describe('Testing scopes', function() {

    "use strict";

    var $rootScope, $scope, $compile, element, Inspector, Monitor;

    var compileTpl = function(tpl,scope) {
        var el = $compile(tpl)(scope);
        scope.$digest();
        return el;
    };

    beforeEach(module('integration-example'));
    beforeEach(module('scope-aware'));

    beforeEach(inject(function(_$rootScope_, _$compile_, _Inspector_, _Monitor_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $scope = $rootScope.$new();

        var tpl = '<div id="main" ng-controller="MainCtrl" class="mainctrl">' +
            '  <h1>1. {{name}}</h1>' +
            '  Give me a name: <input ng-model="name">' +
            '  Set the default category: <input ng-model="category">' +
            '  <ul>' +
            '    <li ng-repeat="itm in items">' +
            '      {{itm.val}}' +
            '      <data-marker data-category="{{itm.val}}"></data-marker>' +
            '    </li>  ' +
            '  </ul>' +
            '  ' +
            '  <div ng-controller="SubCtrl" class="subctrl">' +
            '    <h2>2. {{name}}</h2>' +
            '    Give me a name: <input ng-model="name">' +
            '    <ul>' +
            '      <li ng-repeat="itm in items">' +
            '        {{itm.val}}' +
            '        <data-marker data-category="{{itm.val}}"></data-marker>' +
            '        <data-shared-marker></data-shared-marker>' +
            '        <section class="inline" ng-include=" \'objects.form\' "></section>' +
            '      </li>  ' +
            '    </ul>' +
            '    ' +
            '    <div ng-controller="SubSubCtrl" class="subsubctrl">' +
            '       <h3>3. {{name}}</h3>' +
            '       Give me a name: <input ng-model="name">' +
            '      <ul>' +
            '        <li ng-repeat="itm in items">' +
            '          {{itm}}' +
            '          <section class="inline" ng-include=" \'primitives.form\' "></section>' +
            '        </li>  ' +
            '      </ul>' +
            '    </div>' +
            '  </div>' +
            '</div>';
        element = compileTpl(tpl,$scope);
        Inspector = _Inspector_;
        Monitor = _Monitor_;
    }));

    describe('integration-example model', function() {

        var mainctrlElement, mainctrlScope,
            subctrlElement, subctrlScope,
            subsubctrlElement, subsubctrlScope;
        beforeEach(function() {
            mainctrlElement = element;
            mainctrlScope = element.scope();

            subctrlElement = angular.element(element.find('div')[0]);
            subctrlScope = subctrlElement.scope();

            subsubctrlElement = angular.element(element.find('div')[1]);
            subsubctrlScope = subsubctrlElement.scope();
        });

        describe('controller model', function() {

            it('inherits name prototypally', function() {
                mainctrlScope.name = 'New name given by MainCtrl';

                expect(subctrlScope).toHaveInheritedMembers('name');
                expect(subctrlScope).toPossiblyShadow('name');
                expect(subctrlScope.name).toEqual(mainctrlScope.name);
            });

            it('shadows name of the parent controller because it\'s a string', function() {
                subctrlScope.name = 'New name given by SubCtrl';
                expect(mainctrlScope.name).toEqual('MainCtrl');
                expect(subctrlScope).toHaveMembers('name');
                expect(subctrlScope).not.toHaveInheritedMembers('name');
                expect(subctrlScope).toShadow('name');
            });
        });

        describe('marker directive model', function() {
            var markerScope;
            beforeEach(function() {
                markerScope = angular.element(element.find('data-marker')[0]).isolateScope();
            });

            it('has isolate scope', function() {
                expect(markerScope).toHaveMembers('category');
                expect(markerScope).not.toHaveInheritedMembers('name');
            });

            it('doesn\'t shadow the category of the parent', function() {
                markerScope.$parent.category = 'Any category';
                markerScope.category = 'C';

                expect(markerScope.$parent.category).toEqual('Any category');
                expect(markerScope.category).toEqual('C');

                expect(markerScope).not.toShadow('category');
            });
        });

        describe('shared marker directive model', function() {
            var sharedMarkerElement, sharedMarkerScope, liParentScope;
            beforeEach(function() {
                sharedMarkerElement = angular.element(element.find('data-shared-marker')[0]);
                sharedMarkerScope = sharedMarkerElement.scope();
                liParentScope = sharedMarkerElement.parent().scope();
            });

            it('has shared scope', function() {
                expect(sharedMarkerScope).toHaveMembers('name', 'items', 'itm');
            });

            it('clobbers the members of the parent', function() {
                sharedMarkerScope.name = 'Name changed by shared directive';
                expect(liParentScope.name).toEqual(sharedMarkerScope.name);
            });

            it('shows the category value if category is somewhere in the parent scope chain', function() {
                expect(sharedMarkerElement.text()).toMatch(new RegExp('^unknown', 'g'));

                //get the input <input ng-model="category">
                var inputCategory = element.find('input')[1];
                angular.element(inputCategory).val('A').triggerHandler('input');
                $scope.$digest();

                expect(sharedMarkerElement.text()).toEqual('very high');
            });
        });

        describe('ng-include model inside SubCtrl', function() {
            var includeElement, includeScope;
            beforeEach(function() {
                includeElement = angular.element(subctrlElement.find('section')[0]);
                includeScope = includeElement.scope();
            });

            it('inherits values prototypally', function() {
                expect(includeScope).toHaveInheritedMembers('name', 'itm', 'items');
                expect(includeScope).toPossiblyShadow('name');
                expect(includeScope).not.toPossiblyShadow('itm', 'items');
            });

            it('doesn\'t shadow the itm', function() {
                expect(includeScope.itm.val).toEqual('D');
                angular.element(includeElement.find('input')).val('A').triggerHandler('input');
                $scope.$digest();
                expect(includeScope.itm.val).toEqual('A');

                expect(includeScope).not.toShadow('itm');
            });
        });

        describe('ng-include model inside SubSubCtrl', function() {
            var includeElement, includeScope;
            beforeEach(function() {
                includeElement = angular.element(subsubctrlElement.find('section')[0]);
                includeScope = includeElement.scope();
            });

            it('inherits values prototypally', function() {
                expect(includeScope).toHaveInheritedMembers('name', 'itm', 'items');
                expect(includeScope).toPossiblyShadow('name', 'itm');
                expect(includeScope).not.toPossiblyShadow('items');
            });

            it('shadows the itm', function() {

                var stat = {running : false};
                Monitor.monitor($rootScope, stat);
                stat.running = false;

                expect(includeScope.itm).toEqual('A');
                angular.element(includeElement.find('input')).val('C').triggerHandler('input');
                $scope.$digest();

                expect(includeScope.itm).toEqual('C');
                expect(includeScope.$parent.itm).toEqual('A');
                expect(includeScope).toShadow('itm');

                Monitor.monitor($rootScope, stat);
            });
        });
    });
});