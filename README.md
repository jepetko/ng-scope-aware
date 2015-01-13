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
    "ng-scope-aware": "~0.0.1"
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
expect(scope).toHaveMembers(['surname', 'address', 'city']);
```

* test for prototypically inherited properties

```js
expect(scope).toHaveInheritedMembers(['name']);
```

* test for property shadowing

Property could be shadowed:
```js
expect(scope).toPossiblyShadow('');
```
Property is shadowed:
```js
expect(scope).toShadow('');
expect(scope).not.toShadow('');
```

* test for child scopes

```js
expect(scope).toHaveChildScopes();
```

### Example 1 (ng-transclude)
### Example 2 (ng-include)
### Example 3 (ng-repeat)
### Integration Example

## in your Code

### Print the scope hierarchy

### Check the warnings
