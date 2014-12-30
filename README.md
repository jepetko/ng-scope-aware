ng-scope-aware
==============

- [About](#about)
- [Usage](#usage)
  - [In your Jasmine tests](#in-your-jasmine-tests)
  - [In your Code](#in-your-code)

# About

Inspects the scopes of the angular application and increases the awareness of the angular scopes

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
