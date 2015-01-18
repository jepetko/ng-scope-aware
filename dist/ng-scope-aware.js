/*! ng-scope-aware - v0.0.2 - 2015-01-18
* https://github.com/jepetko/ng-scope-aware
* Copyright (c) 2015 ;*/
!function(){"use strict";if(angular.module("scope-aware",[]).service("Inspector",["$rootScope",function(a){var b=function(a,c){var d=angular.element(c),e=d.isolateScope()||d.scope();if(e&&e.$id===a)return d;for(var f=0;f<c.childNodes.length;f++){var g=b(a,c.childNodes[f]);if("undefined"!=typeof g)return g}},c=function(a){if(a)for(var b=["ng-repeat","ng-include","ng-transclude","ng-view","ng-switch","ng-controller"],c=0;c<b.length;c++)if(a.attr(b[c]))return b[c]},d=function(a,b){return null===a?!1:a.hasOwnProperty(b)?!(angular.isObject(a[b])||angular.isFunction(a[b])):d.call(null,a.$parent,b)},e=function(a,b,c){var d={};for(var e in a)if(0!==e.indexOf("$")&&"this"!==e&&"constructor"!==e){if("undefined"!=typeof b&&(null===a.$$isolateBindings||"undefined"==typeof a.$$isolateBindings[e])&&!a.hasOwnProperty(e)){var f=!0;c===!0&&(f=!(angular.isObject(a[e])||angular.isFunction(a[e]))),f===!0&&(b[e]=!0)}d[e]=a[e]}return d},f=function(a,g,h){h=h||0;for(var i=0,j="",k="";h>i;)j+="  ",i++;var l=b(a.$id,document.body),m=c(l),n=l&&l.length>0?" <"+l[0].nodeName+">"+(m?" "+m:""):"";k+=j+"[+]-"+a.$id+n+"\n";var o={},p=e(a,o);"function"==typeof g&&g.apply(null,[a.$id,p]);var q=JSON.stringify(p,function(a,b){if(a.indexOf&&0===a.indexOf("$"))return void 0;if("function"==typeof b){var c=b+"",d=/\(.*\)/g.exec(c)[0].replace(/^\(/g,"").replace(/\)$/g,"").split(",");return"function("+d.join(",")+") { ... }"}return b},"   "),r=q.split("\n"),s="";if(angular.forEach(r,function(b){var c=/\s*"(\w+)"\s*\:/g.exec(b),e="";c&&c[1]&&(o[c[1]]&&(e+="inherited property"),d(a.$parent,c[1])&&(e.length>0&&(e+="; "),e+=a.hasOwnProperty(c[1])?" shadowed !!!":" shadowing danger")),""!==e&&(e=" <------ "+e),s+=j+" |     "+b+e+"\n"}),k+=s,"undefined"!=typeof a.$$childHead){for(var t=[],u=a.$$childHead;null!==u;)t.push(u),u=u.$$nextSibling;angular.forEach(t,function(a){k+=f(a,g,h+1)})}return k};return{grabScopeMembers:e,grabElement:b,guessAngularDir:c,hasPrimitivePropInScopeChain:d,inspect:function(b,c){return f(b||a,c)}}}]).service("MiniTemplateEngine",[function(){return{fill:function(a){var b=Array.prototype.slice.call(arguments),c=a.replace(/\{\{[1-9]+\}\}/g,function(a){var c=parseInt(a.replace(/\{/g,"").replace(/\}/g,""),10),d=b[c];return d});return c}}}]).service("JasmineMatchersFactory",["Inspector","MiniTemplateEngine",function(a,b){var c=function(a){if(!a)throw new Error("scope should be an object");if(!a.$id)throw new Error("actual should be an angular scope")},d=function(){return Array.prototype.concat.apply([],arguments).slice(1)},e=function(a,c,d,e,f){var g=[];d.forEach(function(a){-1===c.indexOf(a)&&g.push(a)});var h={};return h.pass=0===g.length,h.message=h.pass?b.fill(e,a,d):b.fill(f,a,c,d,g),h},f=function(){return{compare:function(b,f){c(b),f=d.apply(null,arguments);var g=a.grabScopeMembers(b),h="Scope with ID {{1}} has members ({{2}})",i="Expected scope with ID {{1}} and members [{{2}}] to have members [{{3}}]. Missing members are: [{{4}}]";return e(b.$id,Object.keys(g),f,h,i)}}},g=function(){return{compare:function(b,f){c(b),f=d.apply(null,arguments);var g={};a.grabScopeMembers(b,g);var h="Scope with ID {{1}} has inherited members ({{2}})",i="Expected scope with ID {{1}} and inherited members [{{2}}] to have inherited members [{{3}}]. Missing members are: [{{4}}]";return e(b.$id,Object.keys(g),f,h,i)}}},h=function(){return{compare:function(b){var c=a.grabScopeMembers(b),d={pass:!0};for(var e in c){d.pass=!1;break}return d.message=d.pass?"Scope with ID "+b.$id+" is clean":"Expected scope with ID "+b.$id+" to be clean",d}}},i=function(){return{compare:function(a){var b={pass:!!a.$$childHead};return b.message=b.pass?"Scope with ID "+a.$id+" has at least one child scope":"Expected scope with ID "+a.$id+" to have some child scopes",b}}},j=function(){return{compare:function(b,f){c(b),f=d.apply(null,arguments);var g={};a.grabScopeMembers(b,g,!0);var h="Scope with ID {{1}} can possibly shadow inherited properties ({{2}})",i="Expected scope with ID {{1}} and inherited members [{{2}}] to possibly shadow members [{{3}}]. Missing members are: [{{4}}]";return e(b.$id,Object.keys(g),f,h,i)}}},k=function(){return{compare:function(b,f){c(b),f=d.apply(null,arguments);var g=[],h=b.$$isolateBindings||{};f.forEach(function(c){b.hasOwnProperty(c)&&"undefined"==typeof h[c]&&a.hasPrimitivePropInScopeChain(b.$parent,c)===!0&&g.push(c)});var i="Scope with ID {{1}} is shadowing inherited properties ({{2}})",j="Expected scope with ID {{1}} and inherited members [{{2}}] to shadow members [{{3}}]. Missing members are: [{{4}}]";return e(b.$id,g,f,i,j)}}};return{create:function(){return{toHaveMembers:f,toHaveInheritedMembers:g,toBeCleanScope:h,toHaveChildScopes:i,toPossiblyShadow:j,toShadow:k}}}}]),"undefined"!=typeof jasmine&&"function"==typeof beforeEach){var a=angular.bootstrap(window,["scope-aware"]),b=a.get("JasmineMatchersFactory"),c=b.create();beforeEach(function(){jasmine.addMatchers(c)})}}();