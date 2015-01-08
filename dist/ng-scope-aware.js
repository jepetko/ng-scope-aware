/*! ng-scope-aware - v0.0.1 - 2015-01-08
* https://github.com/jepetko/ng-scope-aware
* Copyright (c) 2015 ;*/
!function(){"use strict";if(angular.module("scope-aware",[]).service("Inspector",["$rootScope",function(a){var b=function(a,b){var c={};for(var d in a)0!==d.indexOf("$")&&"this"!==d&&"constructor"!==d&&(a.hasOwnProperty(d)||(b[d]=!0),c[d]=a[d]);return c},c=function(a,d,e){e=e||0;for(var f=0,g="",h="";e>f;)g+="  ",f++;h+=g+"[+]-"+a.$id+"\n";var i={},j=b(a,i);"function"==typeof d&&d.apply(null,[a.$id,j]);var k=JSON.stringify(j,function(a,b){if("function"==typeof b){var c=b+"",d=/\(.*\)/g.exec(c)[0].replace(/^\(/g,"").replace(/\)$/g,"").split(",");return"function("+d.join(",")+") { ... }"}return b},"   "),l=k.split("\n"),m="";if(angular.forEach(l,function(a){var b=/\s*"(\w+)"\s*\:/g.exec(a),c="";b&&b[1]&&i[b[1]]&&(c=" <---- suspect: inherited property"),m+=g+" |     "+a+c+"\n"}),h+=m,"undefined"!=typeof a.$$childHead){for(var n=[],o=a.$$childHead;null!==o;)n.push(o),o=o.$$nextSibling;angular.forEach(n,function(a){h+=c(a,d,e+1)})}return h};return{grabScopeMembers:b,inspect:function(b,d){return c(b||a,d)}}}]).service("MiniTemplateEngine",[function(){return{fill:function(a){var b=Array.prototype.slice.call(arguments),c=a.replace(/\{\{[1-9]+\}\}/g,function(a){var c=parseInt(a.replace(/\{/g,"").replace(/\}/g,""),10),d=b[c];return d});return c}}}]).service("JasmineMatchersFactory",["Inspector","MiniTemplateEngine",function(a,b){var c=function(a){if(!a)throw new Error("scope should be an object");if(!a.$id)throw new Error("actual should be an angular scope")},d=function(a,c,d,e,f){var g=[];d.forEach(function(a){-1===c.indexOf(a)&&g.push(a)});var h={};return h.pass=0===g.length,h.message=h.pass?b.fill(e,a,d):b.fill(f,a,c,d,g),h},e=function(){return{compare:function(b,e){c(b);var f=a.grabScopeMembers(b),g="Scope with ID {{1}} has members ({{2}})",h="Expected scope with ID {{1}} and members [{{2}}] to have members [{{3}}]. Missing members are: [{{4}}]";return d(b.$id,Object.keys(f),e,g,h)}}},f=function(){return{compare:function(b,e){c(b);var f={};a.grabScopeMembers(b,f);var g="Scope with ID {{1}} has inherited members ({{2}})",h="Expected scope with ID {{1}} and inherited members [{{2}}] to have inherited members [{{3}}]. Missing members are: [{{4}}]";return d(b.$id,Object.keys(f),e,g,h)}}},g=function(){return{compare:function(b){var c=a.grabScopeMembers(b),d={pass:!0};for(var e in c){d.pass=!1;break}return d.message=d.pass?"Scope with ID "+b.$id+" is clean":"Expected scope with ID "+b.$id+" to be clean",d}}},h=function(){return{compare:function(a){var b={pass:!!a.$$childHead};return b.message=b.pass?"Scope with ID "+a.$id+" has at least one child scope":"Expected scope with ID "+a.$id+" to have some child scopes",b}}},i=function(){return{compare:function(b,e){c(b);var f={};a.grabScopeMembers(b,f);var g="Scope with ID {{1}} can possibly shadow inherited properties ({{2}})",h="Expected scope with ID {{1}} and inherited members [{{2}}] to possibly shadow members [{{3}}]. Missing members are: [{{4}}]";return d(b.$id,Object.keys(f),e,g,h)}}},j=function(){return{compare:function(a,b){c(a);var e=function(a,b){return null===a?!1:a.hasOwnProperty(b)?!0:e.call(null,a.$parent,b)},f=[];b.forEach(function(b){a.hasOwnProperty(b)&&e(a.$parent,b)===!0&&f.push(b)});var g="Scope with ID {{1}} is shadowing inherited properties ({{2}})",h="Expected scope with ID {{1}} and inherited members [{{2}}] to shadow members [{{3}}]. Missing members are: [{{4}}]";return d(a.$id,f,b,g,h)}}};return{create:function(){return{toHaveMembers:e,toHaveInheritedMembers:f,toBeCleanScope:g,toHaveChildScopes:h,toPossiblyShadow:i,toShadow:j}}}}]),jasmine&&"function"==typeof beforeEach){var a=angular.bootstrap(window,["scope-aware"]),b=a.get("JasmineMatchersFactory"),c=b.create();beforeEach(function(){jasmine.addMatchers(c)})}}();