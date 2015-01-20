ng-scope-aware
==============

THIS IS WORK IN PROGRESS.

- [About](#about)
- [Usage](#usage)
  - [In your Jasmine tests](#in-your-jasmine-tests)
  - [In your Code](#in-your-code)

# About

Inspects the scopes of the angular application and increases the awareness of the angular scopes. The angular scope is the model keeping the data of your application. It reflects how data are shared by the particular components and from where the access to them takes place.
Use this npm package to test the scopes (aka your models).

If you are not familiar with scopes please read this fantastic guide first:
[Understanding Scopes](https://github.com/angular/angular.js/wiki/Understanding-Scopes)

# Installation

## add it to your dependencies

```js
{
  "name": "your-project",
  "version": "0.0.1",
  //....
  "devDependencies": {
    "angular": "1.3.8",
    "angular-mocks": "1.3.8",
    "angular-resource": "1.3.8",
    // ... more dependencies
    "ng-scope-aware"
  }
}
```

## edit your karma.conf.js

```js
// list of files / patterns to load in the browser
files: [
    'node_modules/angular/angular.js',
    'node_modules/angular-resource/angular-resource.js',
    'node_modules/angular-mocks/angular-mocks.js',

    //add the file path
    'node_modules/ng-scope-aware/dist/ng-scope-aware.js',

    //source code:
    'app/js/*.js',
    'app/templates/*.html',

    //tests:
    'tests/*.js'
]
```


# Usage

## in your Jasmine tests

Use the custom matchers to check the structure of your scope.

* test for expected scope properties

```js
expect(scope).toHaveMembers('surname', 'address', 'city');
```

* test for prototypically inherited properties

```js
expect(scope).toHaveInheritedMembers('name');
```

* test for property shadowing

Property could be shadowed:
```js
expect(scope).toPossiblyShadow('token');
```
Property is shadowed:
```js
expect(scope).toShadow('token');
expect(scope).not.toShadow('token');
```

* test for child scopes

```js
expect(scope).toHaveChildScopes();
```

### Example 1 (ng-repeat)

**ng-repeat** will create a new child scope per item. Your keys should be objects otherwise changes made in child scope have no effect to the parent scope.
 
[NgRepeat.test.js](tests/NgRepeat.test.js)

#### using primitives

 ```js
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

    it("doesn't change the original value because primitives are used",function() {
        var input = el.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

        //the value in the parent scope is still 'a' because primitives are used
        expect(scope.val).toBe('AAA');
        expect($scope.values[0]).toBe('a');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('val');
        expect(scope).toHaveInheritedMembers('values');
    });
}); 
```
**Note**: the property 'val' is created for each ng-repeat item so there is no shadowing regarding 'val'.

#### using objects

```js
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

    it("changes the original value",function() {
        var input = el.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

         //the value in the parent scope is 'AAA'
        expect(scope.val.key).toBe('AAA');
        expect($scope.values[0]).toEqual(jasmine.objectContaining({key: 'AAA'}));

        //additional tests (ng-scope-aware)
        //.. creates an own member 'val'
        expect(scope).toHaveMembers('val');
        //.. inherits 'values' but not 'val'
        expect(scope).toHaveInheritedMembers('values');
    });
});
```

### Example 2 (ng-include)

**ng-include** will create a new child scope and inherits prototypally from the parent scope. Properties can be shadowed.

**Note**: templates must be present in your $templateCache. In this example a template is added in beforeEach method as follows:
```js
$templateCache.put('primitive.tpl', '<div><input ng-model="primitive"></div>');
$templateCache.put('object.tpl', '<div><input ng-model="obj.key"></div>');
```

[NgInclude.test.js](tests/NgInclude.test.js)

#### using primitives

```js
describe('usage of primitives', function () {

    var element;
    beforeEach(function () {

        $scope.primitive = 'a';

        var tpl = "<div><div ng-include=\" 'primitive.tpl' \"></div></div>";
        element = $compile(tpl)($scope);
        $scope.$digest();
        angular.element(document.body).append(element);
    });

    it("doesn't change the original value",function() {
        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

        //the value in the parent scope is still 'a' because primitives are used
        expect(scope.primitive).toBe('AAA');
        expect($scope.primitive).toBe('a');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('primitive');
        expect(scope).not.toHaveInheritedMembers('primitive');
        expect(scope).toShadow('primitive');
    });
});
```

**Note**: property 'primitive' is shadowed because we typed a value into the input field which is bounded to the 'primitive' property. 
This will create a new property in the child scope (scope). The parent scope property ($scope) is not affected. 
Therefore 
```js
expect(scope).toShadow('primitive');
```
will pass.

#### using objects

```js
describe('usage of objects', function () {

    var element;
    beforeEach(function() {

        $scope.obj = { key : 'a' };

        var tpl = "<div><div ng-include=\" 'object.tpl' \"></div></div>";
        element = $compile(tpl)($scope);
        $scope.$digest();
        angular.element(document.body).append(element);
    });
    
    it("changes the original value",function() {
        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

        //the value in the parent scope is changed as well
        expect(scope.obj.key).toBe('AAA');
        expect($scope.obj.key).toBe('AAA');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('obj');
        expect(scope).toHaveInheritedMembers('obj');
        expect(scope).not.toShadow('obj');
    });
});
```
**Note**: property 'obj' is *NOT* shadowed because we are using 'obj' as model of the input field. When typing a new value the original object is changed. 
The parent scope property ($scope) is affected. 
Therefore 
```js
expect(scope).not.toShadow('obj');
```
will pass.

### Example 3 (ng-view)

**ng-view** will create a new child scope and inherits prototypally from the parent scope. Properties can be shadowed.

**Note**: in this case the tested module has to configure routing, e.g.:

```js
angular.module('my-module', ['ngRoute'])
.config( ['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/primitive', {
            template: '<input ng-model="primitive">'
        })
        .when('/object', {
            template: '<input ng-model="obj.key">'
        })
        .otherwise({redirectTo: '/index'});
    $locationProvider.html5Mode(true);
}])
```

[NgView.test.js](tests/NgView.test.js)

#### using primitives

```js
describe('usage of primitives', function () {

    beforeEach(inject(function($location) {
        $scope.primitive = 'a';

        $location.path('/primitive');
        $rootScope.$digest();
    }));

    it("doesn't change the original value",function() {

        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

        //the value in the parent scope is still 'a' because primitives are used
        expect(scope.primitive).toBe('AAA');
        expect($scope.primitive).toBe('a');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('primitive');
        expect(scope).not.toHaveInheritedMembers('primitive');
        expect(scope).toShadow('primitive');
    });
});
```

**Note:** the property "primitive" is shadowed because it's a primitive.

#### using objects

```js
describe('usage of objects', function () {

    beforeEach(inject(function ($location) {
        $scope.obj = { key : 'a' };

        $location.path('/object');
        $rootScope.$digest();
    }));
    
    it("changes the original value",function() {
        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

        //the value in the parent scope is changed as well
        expect(scope.obj.key).toBe('AAA');
        expect($scope.obj.key).toBe('AAA');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('obj');
        expect(scope).toHaveInheritedMembers('obj');
        expect(scope).not.toShadow('obj');
    });
});
```

**Note:** the property "obj" is not shadowed because it's an object.

### Example 4 (ng-switch)

**ng-switch** will create a new child scope and inherits prototypally from the parent scope. Properties can be shadowed.

#### using primitives

```js
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
        $scope.$digest();
    });

    it("doesn't change the original value",function() {
        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('b').triggerHandler('input');
        $scope.$digest();

        //the 'A' element is still selected because we didn't change the original property value
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
```

**Note:** `$scope.primitive` is still `'a'` because a new property `primitive` has been created on the `ng-switch` scope. Hence `$scope.primitive` is shadowed.

#### using objects

```js
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
    
    it("changes the original value",function() {
        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('b').triggerHandler('input');
        $scope.$digest();

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
```

**Note:** `$scope.obj` is changed to `'b'` because it was changed by `ng-model="obj.key"`. There is no property shadowing.

### Example 5 (directive with shared scope)
### Example 6 (directive with own scope)
### Example 7 (directive with isolate scope)

### Integration Example

TODO

## in your Code

### Print the scope hierarchy
```js
console.log(Inspector.inspect(scope));
```

### Check the warnings

TODO
