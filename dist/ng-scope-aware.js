/*! ng-scope-aware - v0.0.2 - 2015-01-16
* https://github.com/jepetko/ng-scope-aware
* Copyright (c) 2015 ;*/
!function(){"use strict";if(angular.module("scope-aware",[]).service("Inspector",["$rootScope",function(a){var b=function(a,c){var d=angular.element(c),e=d.isolateScope()||d.scope();if(e&&e.$id===a)return d;for(var f=0;f<c.childNodes.length;f++){var g=b(a,c.childNodes[f]);if("undefined"!=typeof g)return g}},c=function(a){if(a)for(var b=["ng-repeat","ng-include","ng-transclude"],c=0;c<b.length;c++)if(a.attr(b[c]))return b[c]},d=function(a,b,c){var d={};for(var e in a)if(0!==e.indexOf("$")&&"this"!==e&&"constructor"!==e){if("undefined"!=typeof b&&!a.hasOwnProperty(e)){var f=!0;c===!0&&(f=!(angular.isObject(a[e])||angular.isFunction(a[e]))),f===!0&&(b[e]=!0)}d[e]=a[e]}return d},e=function(a,f,g){g=g||0;for(var h=0,i="",j="";g>h;)i+="  ",h++;var k=b(a.$id,document.body),l=c(k),m=k&&k.length>0?" <"+k[0].nodeName+">"+(l?" "+l:""):"";j+=i+"[+]-"+a.$id+m+"\n";var n={},o=d(a,n);"function"==typeof f&&f.apply(null,[a.$id,o]);var p=JSON.stringify(o,function(a,b){if(a.indexOf&&0===a.indexOf("$"))return void 0;if("function"==typeof b){var c=b+"",d=/\(.*\)/g.exec(c)[0].replace(/^\(/g,"").replace(/\)$/g,"").split(",");return"function("+d.join(",")+") { ... }"}return b},"   "),q=p.split("\n"),r="";if(angular.forEach(q,function(a){var b=/\s*"(\w+)"\s*\:/g.exec(a),c="";b&&b[1]&&n[b[1]]&&(c=" <---- suspect: inherited property"),r+=i+" |     "+a+c+"\n"}),j+=r,"undefined"!=typeof a.$$childHead){for(var s=[],t=a.$$childHead;null!==t;)s.push(t),t=t.$$nextSibling;angular.forEach(s,function(a){j+=e(a,f,g+1)})}return j};return{grabScopeMembers:d,grabElement:b,guessAngularDir:c,inspect:function(b,c){return e(b||a,c)}}}]).service("MiniTemplateEngine",[function(){return{fill:function(a){var b=Array.prototype.slice.call(arguments),c=a.replace(/\{\{[1-9]+\}\}/g,function(a){var c=parseInt(a.replace(/\{/g,"").replace(/\}/g,""),10),d=b[c];return d});return c}}}]).service("JasmineMatchersFactory",["Inspector","MiniTemplateEngine",function(a,b){var c=function(a){if(!a)throw new Error("scope should be an object");if(!a.$id)throw new Error("actual should be an angular scope")},d=function(a,c,d,e,f){var g=[];d.forEach(function(a){-1===c.indexOf(a)&&g.push(a)});var h={};return h.pass=0===g.length,h.message=h.pass?b.fill(e,a,d):b.fill(f,a,c,d,g),h},e=function(){return{compare:function(b,e){c(b);var f=a.grabScopeMembers(b),g="Scope with ID {{1}} has members ({{2}})",h="Expected scope with ID {{1}} and members [{{2}}] to have members [{{3}}]. Missing members are: [{{4}}]";return d(b.$id,Object.keys(f),e,g,h)}}},f=function(){return{compare:function(b,e){c(b);var f={};a.grabScopeMembers(b,f);var g="Scope with ID {{1}} has inherited members ({{2}})",h="Expected scope with ID {{1}} and inherited members [{{2}}] to have inherited members [{{3}}]. Missing members are: [{{4}}]";return d(b.$id,Object.keys(f),e,g,h)}}},g=function(){return{compare:function(b){var c=a.grabScopeMembers(b),d={pass:!0};for(var e in c){d.pass=!1;break}return d.message=d.pass?"Scope with ID "+b.$id+" is clean":"Expected scope with ID "+b.$id+" to be clean",d}}},h=function(){return{compare:function(a){var b={pass:!!a.$$childHead};return b.message=b.pass?"Scope with ID "+a.$id+" has at least one child scope":"Expected scope with ID "+a.$id+" to have some child scopes",b}}},i=function(){return{compare:function(b,e){c(b);var f={};a.grabScopeMembers(b,f,!0);var g="Scope with ID {{1}} can possibly shadow inherited properties ({{2}})",h="Expected scope with ID {{1}} and inherited members [{{2}}] to possibly shadow members [{{3}}]. Missing members are: [{{4}}]";return d(b.$id,Object.keys(f),e,g,h)}}},j=function(){return{compare:function(a,b){c(a);var e=function(a,b){return null===a?!1:a.hasOwnProperty(b)?!(angular.isObject(a[b])||angular.isFunction(a[b])):e.call(null,a.$parent,b)},f=[];b.forEach(function(b){a.hasOwnProperty(b)&&e(a.$parent,b)===!0&&f.push(b)});var g="Scope with ID {{1}} is shadowing inherited properties ({{2}})",h="Expected scope with ID {{1}} and inherited members [{{2}}] to shadow members [{{3}}]. Missing members are: [{{4}}]";return d(a.$id,f,b,g,h)}}};return{create:function(){return{toHaveMembers:e,toHaveInheritedMembers:f,toBeCleanScope:g,toHaveChildScopes:h,toPossiblyShadow:i,toShadow:j}}}}]),"undefined"!=typeof jasmine&&"function"==typeof beforeEach){var a=angular.bootstrap(window,["scope-aware"]),b=a.get("JasmineMatchersFactory"),c=b.create();beforeEach(function(){jasmine.addMatchers(c)})}}();