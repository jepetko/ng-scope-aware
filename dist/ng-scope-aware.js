/*! ng-scope-aware - v0.0.2 - 2015-01-21
* https://github.com/jepetko/ng-scope-aware
* Copyright (c) 2015 ;*/
!function(a){"use strict";if(a.module("scope-aware",[]).service("Inspector",["$rootScope",function(b){var c=function(b,d){var e=a.element(d),f=e.isolateScope()||e.scope();if(f&&f.$id===b)return e;for(var g=0;g<d.childNodes.length;g++){var h=c(b,d.childNodes[g]);if("undefined"!=typeof h)return h}},d=function(a){if(a)for(var b=["ng-repeat","ng-include","ng-transclude","ng-view","ng-switch","ng-controller"],c=0;c<b.length;c++)if(a.attr(b[c]))return b[c]},e=function(a){return"undefined"!=typeof Object.getPrototypeOf?Object.getPrototypeOf(a):a.__proto__},f=function(b,c){return null===b?!1:b.hasOwnProperty(c)?!(a.isObject(b[c])||a.isFunction(b[c])):f.call(null,e(b),c)},g=function(b,c,d){var e={};for(var f in b)if(0!==f.indexOf("$")&&"this"!==f&&"constructor"!==f){if("undefined"!=typeof c&&(null===b.$$isolateBindings||"undefined"==typeof b.$$isolateBindings[f])&&!b.hasOwnProperty(f)){var g=!0;d===!0&&(g=!(a.isObject(b[f])||a.isFunction(b[f]))),g===!0&&(c[f]=!0)}e[f]=b[f]}return e},h=function(b,i,j){j=j||0;for(var k=0,l="",m="";j>k;)l+="  ",k++;var n=c(b.$id,document.body),o=d(n),p=n&&n.length>0?" <"+n[0].nodeName+">"+(o?" "+o:""):"";m+=l+"[+]-"+b.$id+p+"\n";var q={},r=g(b,q);"function"==typeof i&&i.apply(null,[b.$id,r]);var s=JSON.stringify(r,function(a,b){if(a.indexOf&&0===a.indexOf("$"))return void 0;if("function"==typeof b){var c=b+"",d=/\(.*\)/g.exec(c)[0].replace(/^\(/g,"").replace(/\)$/g,"").split(",");return"function("+d.join(",")+") { ... }"}return b},"	"),t=s.split("\n"),u="";if(a.forEach(t,function(a){var c=/^\t"(\w+)"\s*\:/g.exec(a),d="";c&&c[1]&&(q[c[1]]&&(d+="inherited property"),f(e(b),c[1])&&(d.length>0&&(d+="; "),d+=b.hasOwnProperty(c[1])?" shadowed !!!":" shadowing danger")),""!==d&&(d=" <------ "+d),u+=l+" |     "+a+d+"\n"}),m+=u,"undefined"!=typeof b.$$childHead){for(var v=[],w=b.$$childHead;null!==w;)v.push(w),w=w.$$nextSibling;a.forEach(v,function(a){m+=h(a,i,j+1)})}return m};return{grabScopeMembers:g,grabElement:c,guessAngularDir:d,getProto:e,hasPrimitivePropInScopeChain:f,inspect:function(a,c){return h(a||b,c)}}}]).service("MiniTemplateEngine",[function(){return{fill:function(a){var b=Array.prototype.slice.call(arguments),c=a.replace(/\{\{[1-9]+\}\}/g,function(a){var c=parseInt(a.replace(/\{/g,"").replace(/\}/g,""),10),d=b[c];return d});return c}}}]).service("JasmineMatchersFactory",["Inspector","MiniTemplateEngine",function(a,b){var c=function(a){if(!a)throw new Error("scope should be an object");if(!a.$id)throw new Error("actual should be an angular scope")},d=function(){return Array.prototype.concat.apply([],arguments).slice(1)},e=function(a,c,d,e,f){var g=[];d.forEach(function(a){-1===c.indexOf(a)&&g.push(a)});var h={};return h.pass=0===g.length,h.message=h.pass?b.fill(e,a,d):b.fill(f,a,c,d,g),h},f=function(){return{compare:function(b,f){c(b),f=d.apply(null,arguments);var g=a.grabScopeMembers(b),h="Scope with ID {{1}} has members ({{2}})",i="Expected scope with ID {{1}} and members [{{2}}] to have members [{{3}}]. Missing members are: [{{4}}]";return e(b.$id,Object.keys(g),f,h,i)}}},g=function(){return{compare:function(b,f){c(b),f=d.apply(null,arguments);var g={};a.grabScopeMembers(b,g);var h="Scope with ID {{1}} has inherited members ({{2}})",i="Expected scope with ID {{1}} and inherited members [{{2}}] to have inherited members [{{3}}]. Missing members are: [{{4}}]";return e(b.$id,Object.keys(g),f,h,i)}}},h=function(){return{compare:function(b){var c=a.grabScopeMembers(b),d={pass:!0};for(var e in c){d.pass=!1;break}return d.message=d.pass?"Scope with ID "+b.$id+" is clean":"Expected scope with ID "+b.$id+" to be clean",d}}},i=function(){return{compare:function(a){var b={pass:!!a.$$childHead};return b.message=b.pass?"Scope with ID "+a.$id+" has at least one child scope":"Expected scope with ID "+a.$id+" to have some child scopes",b}}},j=function(){return{compare:function(b,f){c(b),f=d.apply(null,arguments);var g={};a.grabScopeMembers(b,g,!0);var h="Scope with ID {{1}} can possibly shadow inherited properties ({{2}})",i="Expected scope with ID {{1}} and inherited members [{{2}}] to possibly shadow members [{{3}}]. Missing members are: [{{4}}]";return e(b.$id,Object.keys(g),f,h,i)}}},k=function(){return{compare:function(b,f){c(b),f=d.apply(null,arguments);var g=[],h=b.$$isolateBindings||{};f.forEach(function(c){b.hasOwnProperty(c)&&"undefined"==typeof h[c]&&a.hasPrimitivePropInScopeChain(a.getProto(b),c)===!0&&g.push(c)});var i="Scope with ID {{1}} is shadowing inherited properties ({{2}})",j="Expected scope with ID {{1}} and inherited members [{{2}}] to shadow members [{{3}}]. Missing members are: [{{4}}]";return e(b.$id,g,f,i,j)}}};return{create:function(){return{toHaveMembers:f,toHaveInheritedMembers:g,toBeCleanScope:h,toHaveChildScopes:i,toPossiblyShadow:j,toShadow:k}}}}]),"undefined"!=typeof jasmine&&"function"==typeof beforeEach){var b=a.bootstrap(window,["scope-aware"]),c=b.get("JasmineMatchersFactory"),d=c.create();beforeEach(function(){jasmine.addMatchers(d)})}}(angular);