ng-scope-aware
==============

THIS IS WORK IN PROGRESS.

- [About](#about)
- [Usage](#usage)
  - [In your Jasmine tests](#in-your-jasmine-tests)
    - [ng-repeat](#ng-repeat)
    - [ng-include](#ng-include)
    - [ng-view](#ng-view)
    - [directive with shared scope](#directive-with-shared-scope)
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

* property could be shadowed

```js
expect(scope).toPossiblyShadow('token');
```
* property is shadowed

```js
expect(scope).toShadow('token');
expect(scope).not.toShadow('token');
```

* test for child scopes

```js
expect(scope).toHaveChildScopes();
```

### ng-repeat

**ng-repeat** creates a new child scope per item. Your keys should be objects otherwise changes made in child scope have no effect to the parent scope.
 
[NgRepeat.test.js](tests/NgRepeat.test.js)

#### using primitives

 ```js
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
    });
});
```
**Note**: the property `val` is created for each `ng-repeat` item which will shadow the property in the parent scope (`$scope`).

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
    });
});
```
**Note**: the property `val` is created for each `ng-repeat` item but there is a reference to the original `values` array. 
The elements in `values` are changed if `val` (in `ng-repeat`) gets changed. The property `$scope.val` isn't changed because `val` (in `ng-repeat`) 
doesn't refer to it.

**Note 2**: `.toShadow` or `.not.toShadow` is not applicable because each iteration of `ng-repeat` creates a new child scope 
and that new child scope always gets a new property.

### ng-include

**ng-include** creates a new child scope and inherits prototypally from the parent scope. Properties can be shadowed.

**Note**: templates must be present in your `$templateCache`. In this example templates are added in `beforeEach` method as follows:
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

**Note**: property `primitive` is shadowed because a new text is inserted into the input field which is bounded to the `primitive` property. 
This creates a new property in the child scope (`scope`). The parent scope property (`$scope`) is not affected. 
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
**Note**: property `obj` is *NOT* shadowed because we are using `obj` as model for the input field. When typing a new value the original object is changed. 
The parent scope property (`$scope`) is affected. 
Therefore 
```js
expect(scope).not.toShadow('obj');
```
will pass.

### ng-view

**ng-view** creates a new child scope and inherits prototypally from the parent scope. Properties can be shadowed.

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

**Note:** the property `primitive` is shadowed because it's a primitive.

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

**Note:** the property `obj` is *NOT* shadowed because it's an object.

### ng-switch

**ng-switch** creates a new child scope and inherits prototypally from the parent scope. Properties can be shadowed.

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

**Note:** `$scope.primitive` is still `'a'` because a new property `primitive` is created on the `ng-switch` scope when typing a new text into the input field. 
Hence `$scope.primitive` is shadowed.

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

**Note:** `$scope.obj` is changed to `'b'` because it's an object. There is no property shadowing.

### directive with shared scope

Directives with shared scope don't create any new scope. They operate on the properties of the present scope.

The used directive is configured as follows:
```js
.directive('directiveSharedScope', function() {
    return {
        'restrict' : 'AE',
        'replace': true,
        'template' : '<div>{{token}}<input ng-model="token"></div>'
    };	
 })
```

#### using primitives or objects

```js
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
});
```
*Note*: if you are wondering why we don't test
```js
    expect(scope).not.toHaveInheritedMembers('token');
    expect(scope).not.toShadow('token');
```
it's because we would test the shared scope (coming from outside) which doesn't make a sense in terms of the directive test case.

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
