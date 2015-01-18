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

**ng-repeat** will create a new scope per item. Your keys should be objects otherwise changes made in child scope have no effect to the parent scope.
 
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
### Example 3 (ng-view)
### Example 4 (ng-switch)
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
