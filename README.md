ng-scope-aware
==============

THIS IS WORK IN PROGRESS.

- [About](#about)
- [Usage](#usage)
  - [In your Jasmine tests](#in-your-jasmine-tests)
    - [ng-repeat](#ng-repeat)
    - [ng-include](#ng-include)
    - [ng-view](#ng-view)
    - [ng-switch](#ng-switch)
    - [directive with shared scope](#directive-with-shared-scope)
    - [directive with own scope](#directive-with-own-scope)
    - [directive with isolate scope](#directive-with-isolate-scope)
    - [directive with ng-transclude](#directive-with-ng-transclude)
  - [In your Code](#in-your-code)

# About

Inspects the scopes of the angular application and increases the awareness of the angular scopes. The angular scope is the model keeping the data of your application. It reflects how data are shared by the particular components and from where the access to them takes place.
Use this npm package to test the scopes (aka your models).

If you are not familiar with scopes please read this fantastic guide first:
[Understanding Scopes](https://github.com/angular/angular.js/wiki/Understanding-Scopes)

Here is a brief overview about the particular angular constructs and those behavior in terms of scopes:

| Angular construct                            | Does it create a new scope? | Does it inherit from the parent scope?           |
|----------------------------------------------|-----------------------------|--------------------------------------------------|
| ng-repeat                                    |             YES             |                        YES                       |
| ng-include                                   |             YES             |                        YES                       |
| ng-switch                                    |             YES             |                        YES                       |
| ng-view                                      |             YES             |                        YES                       |
| ng-controller                                |             YES             |                        YES                       |
| Directive with { scope : false }             |              NO             | NOT APPLICABLE (because there is no inheritance) |
| Directive with   { scope : true }            |             YES             |                        YES                       |
| Directive with isolate scope { scope :  {} } |             YES             |                        NO                        |
| ng-transclude                                |             YES             |                                                  |

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
    
    // =====> add the dependency to your application
    "ng-scope-aware"
  }
}
```

## edit your karma.conf.js

```js
module.exports = function(config) {

    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '.',


        // =====> use jasmine for scope tests
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            //your angular libraries
            'node_modules/angular/angular.js',
            'node_modules/angular-resource/angular-resource.js',
            'node_modules/angular-mocks/angular-mocks.js',
            
            // =====> reference "ng-scope-aware"
            'node_modules/ng-scope-aware/dist/ng-scope-aware.js',

            //your source code and templates
            'js/*.js',
            'templates/*.html',

            //tests:
            'tests/*.js'
        ],


        // list of files to exclude
        exclude: [
            //'js/whatever.js',
        ],


        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress', 'html'],

        //... more configuration ...
                
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: ['PhantomJS'],
        //browsers: ['Chrome'],
        captureTimeout: 5000,
        singleRun: true
    });
};
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

[NgSwitch.test.js](tests/NgSwitch.test.js)

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

Directives with `{scope : false}` don't create a new scope. They operate on the properties of the present (shared) scope.

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

[NgDirectiveWithScopeFalse.test.js](tests/NgDirectiveWithScopeFalse.test.js)

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

### directive with own scope

Directives with `{scope : true}` create a new scope. It inherits from the parent scope which means that primitives can be shadowed.

[NgDirectiveWithScopeTrue.test.js](tests/NgDirectiveWithScopeTrue.test.js)

#### using primitives

*Note*: the used directive is configured as follows:

```js
.directive('directiveSharedScopeExplicitTrue', function() {
    return {
        'scope': true,
        'restrict' : 'AE',
        'replace': true,
        'template' : '<div>{{token}}<input ng-model="token"></div>'
    };	
 })
```

```js
describe('when primitives are used', function() {

    var $scope, element;
    beforeEach(function() {
        $scope = $rootScope.$new();
        $scope.token = 'a';
        element = InspectorHelpers.createDirective('directiveSharedScopeExplicitTrue', $scope);
    });

    it("shadows primitive properties", function () {
        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

        //the value of token in the paren scope is still 'a' because the property has been shadowed
        expect(scope.token).toBe('AAA');
        expect($scope.token).toBe('a');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('token');
        expect(scope).not.toHaveInheritedMembers('token');
        expect(scope).toShadow('token');
    });
});
```

**Note:** `$scope.primitive` is still `'a'` because a new property `primitive` is created on the directive `directive-shared-scope-explicit-true` scope when a new text is inserted into the input field. 
Therefore `$scope.primitive` is shadowed.

#### using objects

The used directive is configured as follows:

```js
.directive('directiveSharedScopeExplicitTrue', function() {
    return {
        'scope': true,
        'restrict' : 'AE',
        'replace': true,
        'template' : '<div>{{tokenobj.token}}<input ng-model="tokenobj.token"></div>'
    };	
 })
```

```js
describe('when objects are used', function() {

    var $scope, element;
    beforeEach(function() {
        $scope = $rootScope.$new();
        $scope.tokenobj = { token : 'a' };
        element = InspectorHelpers.createDirective('directiveSharedScopeExplicitTrueWithObject', $scope);
    });

    it("inherits objects and doesn't shadow them", function () {
        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

        //the value of token in the parent scope is 'AAA' because object is used
        expect(scope.tokenobj.token).toBe('AAA');
        expect($scope.tokenobj.token).toBe('AAA');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('tokenobj');
        expect(scope).toHaveInheritedMembers('tokenobj');
        expect(scope).not.toShadow('token');
        expect(scope).not.toShadow('tokenobj');
    });
});
```
**Note:** `$scope.tokenobj` is changed to `'AAA'` because it's an object. There is no property shadowing.

### directive with isolate scope

Directives with isolate/isolated scope create their own scope which don't inherit at all. The values are passed from outside if you configure them in the directive (by `@`, `=` or `&`).  

[NgDirectiveWithIsolatedScope.test.js](tests/NgDirectiveWithIsolatedScope.test.js)

#### using primitives

The directive tested here:

```js
.directive('directiveIsolatedScopeWithString', function() {
    return {
        'scope' : {
            'token': '@'
        },
        'restrict' : 'AE',
        'replace': true,
        'template' : '<div>{{tokenobj.token}}<input ng-model="tokenobj.token"></div>'
    };	
 })
```

The compiled template looks like this:
```html
<directive-isolated-scope-with-string token="{{alienToken}}"></directive-isolated-scope-with-string>
```
*Test*:

```js
describe('when primitives are used', function() {

    var $scope, element;
    beforeEach(function() {
        $scope = $rootScope.$new();
        $scope.token = 'a';
        element = InspectorHelpers.createDirective('directiveIsolatedScopeWithString', $scope);
    });

    it("doesn't shadow primitives because isolated scope is used", function () {
        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();
        
        //the value of token in the parent scope is still 'a' because there token is referenced by '@' (string)
        expect(scope.token).toBe('AAA');
        expect($scope.token).toBe('a');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('token');
        expect(scope).not.toHaveInheritedMembers('token');
        expect(scope).not.toShadow('token');
    });
});
```    

*Note*: there is no bi-directional binding when `@``is used. Therefore, the property `$scope.token` (passed property) remains unchanged. Consider, 
that there is no shadowing because there is no prototypal inheritance. Therefore this test will pass:
```js
expect(scope).not.toShadow('token');
```

#### using objects

The directive tested here:

```js
.directive('directiveIsolatedScopeWithObject', function() {
    return {
        'scope' : {
            'tokenobj': '='
        },
        'restrict' : 'AE',
        'replace': true,
        'template' : '<div>{{tokenobj.token}}<input ng-model="tokenobj.token"></div>'
    };	
 })
```

The compiled template looks like this:
```html
<directive-isolated-scope-with-object tokenobj="alienTokenObj"></directive-isolated-scope-with-object>
```

```js
describe('when objects are used', function() {

    var $scope, element;
    beforeEach(function() {
        $scope = $rootScope.$new();
        $scope.alienTokenObj = { token : 'a' };
        element = InspectorHelpers.createDirective('directiveIsolatedScopeWithObject', $scope);
    });

    it("doesn't shadow objects because isolated scope is used", function () {
        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

        //the value of token in the parent scope is 'AAA' because object is used (= operator for isolated scope)
        expect(scope.tokenobj.token).toBe('AAA');
        expect($scope.alienTokenObj.token).toBe('AAA');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('tokenobj');
        //there is no prototypal inheritance at all
        expect(scope).not.toHaveInheritedMembers('tokenobj');
        expect(scope).not.toHaveInheritedMembers('alienTokenObj');
        //there is no shadowing
        expect(scope).not.toShadow('tokenobj');
        expect(scope).not.toShadow('alienTokenObj');
    });
});
```

*Note*: there is bi-directional relationship regarding `tokenobj`. If the `tokenobj.token` is changed inside the scope the changes are propagated 
to the outer scope (`alienTokenObj.token`). There is no inheritance and no shadowing.

### directive with ng-transclude

`ng-transclude` behaves like this (from https://docs.angularjs.org/api/ng/service/$compile):

*"When you call a transclude function it returns a DOM fragment that is pre-bound to a transclusion scope.
This scope is special, in that it is a child of the directive's scope (and so gets destroyed when the directive's
scope gets destroyed) but it inherits the properties of the scope from which it was taken."*

The directive tested here:

```js
.directive('directiveIsolatedScopeWithPrimitiveAndObjectWithTransclude', function() {
    return {
        'restrict' : 'AE',
        'replace': true,
        'transclude': true,
        'scope': {
            'token': '@',
            'tokenobj': '='
        },
        'template' : '<div><div>{{token}}, {{tokenobj.token}}</div><div ng-transclude></div></div>'
    };	
 })
```

The compiled template looks like this:
```html
<directive-isolated-scope-with-primitive-and-object-with-transclude token="{{alienToken}}" tokenobj="alienTokenObj">
    <div><input ng-model="token"><input ng-model="tokenObj.token"></div>
</directive-isolated-scope-with-primitive-and-object-with-transclude>
```

[NgDirectiveWithIsolatedScopeAndTransclude.test.js](tests/NgDirectiveWithIsolatedScopeAndTransclude.test.js)

#### using primitives

```js
describe('when primitives are used', function() {

    var $scope, element;
    beforeEach(inject(function($compile) {
        $scope = $rootScope.$new();
        $scope.token = 'token';
        $scope.alienToken = 'alienToken';
        $scope.alienTokenObj = {token : 'token_value'};
        element = InspectorHelpers.createDirective('directiveIsolatedScopeWithPrimitiveAndObjectWithTransclude', $scope);
    }));

    it("doesn't shadow primitives because isolated scope is used", function () {
        var input = element.find('input')[0];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

        //Note: transclude will create a new child scope which is child of the isolate scope
        expect(scope.$parent.$parent).toBe($scope);

        //the value of token in the parent scope is still 'a' because there token is referenced by '@' (string)
        // and therefore not changed in the child scope
        expect(scope.token).toBe('AAA');
        expect($scope.token).toBe('token');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('token', 'alienToken', 'alienTokenObj');
        //token is not inherited because it's shadowed
        expect(scope).toHaveInheritedMembers('alienToken', 'alienTokenObj');
        expect(scope).toShadow('token');
    });
});
```

*Note*: the property `token` is shadowed by `ng-transclude`. From inheritance point of view `ng-transclude` inherits from `$scope` rather than `directive-isolated-scope-with-primitive-and-object-with-transclude`.
Even if `scope.$parent` refers to the directive the `__proto__` property refers to `$scope`. Therefore, directive and `ng-transclude` are "siblings".

#### using objects

```js
describe('when objects are used', function() {

    var $scope, element;
    beforeEach(function() {
        $scope = $rootScope.$new();
        $scope.token = 'token';
        $scope.tokenObj = {token : 'from_token_obj'};
        $scope.alienToken = 'alienToken';
        $scope.alienTokenObj = {token : 'from_alien_token_obj'};
        element = InspectorHelpers.createDirective('directiveIsolatedScopeWithPrimitiveAndObjectWithTransclude', $scope);
    });
    
    it("doesn't shadow objects because isolated scope is used", function () {
        var input = element.find('input')[1];
        var scope = angular.element(input).scope();
        angular.element(input).val('AAA').triggerHandler('input');
        $scope.$digest();

        //Note: transclude will create a new child scope which is child of the isolate scope
        //
        //From guide: https://docs.angularjs.org/api/ng/service/$compile
        // "When you call a transclude function it returns a DOM fragment that is pre-bound to a transclusion scope.
        // This scope is special, in that it is a child of the directive's scope (and so gets destroyed when the directive's
        // scope gets destroyed) but it inherits the properties of the scope from which it was taken."
        expect(scope.$parent.$parent).toBe($scope);

        //the value of token in the parent scope is 'AAA' because object is used (= operator for isolated scope)
        expect(scope.tokenObj.token).toBe('AAA');
        expect($scope.tokenObj.token).toBe('AAA');

        //additional tests (ng-scope-aware)
        expect(scope).toHaveMembers('token', 'tokenObj', 'alienToken', 'alienTokenObj');
        expect(scope).toHaveInheritedMembers('token', 'tokenObj', 'alienToken', 'alienTokenObj');
        //there is no shadowing
        expect(scope).not.toShadow('token');
        expect(scope).not.toShadow('tokenObj');
    });
});
```

*Note*: `tokenObj` is not shadowed because it's an object.


## in your Code

### Print the scope hierarchy

```js
console.log(Inspector.inspect(scope));
```

### Check the warnings

TODO
