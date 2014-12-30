ng-scope-aware
==============

# About

Inspects the scopes of the angular application and increases the awareness of the angular scopes

# Usage

## in your Jasmine tests

* test for expected scope properties

```js
expect(scope).toHaveMembers(['surname', 'address', 'city']);
```

* test for prototypically inherited properties

```js
expect(scope).toHaveInheritedMembers(['name']);
```

* test for property shadowing
TODO

* test for child scopes

```js
expect(scope).toHaveChildScopes();
```


## in your Code
