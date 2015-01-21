(function() {
    "use strict";

    angular.module('inspector-test-helpers',['inspector-test-mocks'])
    .service('NodeBuilder', [function() {
        var nodeName = '', attrs = {}, content = '';
        return {
            start : function(name) {
                nodeName = name;
                attrs = {};
                content = '';
                return this;
            },
            addAttr : function(key,val) {
                attrs[key] = val;
                return this;
            },
            addContent: function(c) {
                content = c;
                return this;
            },
            end : function() {
                var str = '<' + nodeName;
                for(var key in attrs) {
                    str += ' ' + key + '="' + attrs[key] + '"';
                }
                str += '>' + content + '</' + nodeName + '>';
                return str;
            }
        };
    }])
    .service('InspectorHelpers', ['$compile', 'NodeBuilder', function($compile, NodeBuilder) {

        var toCamelCase = function (str) {
            if (typeof str === 'undefined') {
                return str;
            }
            var pieces = str.split(/\-/g);
            var result;
            angular.forEach(pieces, function (val) {
                if (typeof result === 'undefined') {
                    result = val.toLowerCase();
                } else {
                    result += val.charAt(0).toUpperCase() + val.slice(1);
                }
            });
            return result;
        };
        var toDashed = function (str) {
            if (typeof str === 'undefined') {
                return str;
            }
            var result = '';
            for (var i = 0; i < str.length; i++) {
                var ch = str.charCodeAt(i);
                if (ch >= 65 && ch <= 90) {
                    result += '-' + str.charAt(i).toLowerCase();
                } else {
                    result += str.charAt(i);
                }
            }
            return result;
        };



        var htmlTemplates = {
            'directiveIsolatedScopeWithString': function () {
                var node = toDashed('directiveIsolatedScopeWithString');
                return NodeBuilder.start(node).addAttr('token', '{{alienToken}}').end();
            },
            'directiveIsolatedScopeWithObject': function () {
                var node = toDashed('directiveIsolatedScopeWithObject');
                return NodeBuilder.start(node).addAttr('tokenobj', 'alienTokenObj').end();
            },
            'directiveIsolatedScopeWithFunction': function () {
                var node = toDashed('directiveIsolatedScopeWithFunction');
                return NodeBuilder.start(node).addAttr('fun','alienFun()').end();
            },
            'directiveIsolatedScopeWithStringWithTransclude': function () {
                var node = toDashed('directiveIsolatedScopeWithStringWithTransclude');
                return NodeBuilder.start(node).addAttr('token', '{{alienToken}}')
                    .addContent('<ul><li>transcluded</li></ul>')
                    .end();
            },
            'directiveIsolatedScopeWithObjectWithTransclude': function () {
                var node = toDashed('directiveIsolatedScopeWithObjectWithTransclude');
                return NodeBuilder.start(node).addAttr('tokenobj', 'alienTokenObj')
                    .addContent('<ul><li>transcluded</li></ul>')
                    .end();
            },
            'directiveIsolatedScopeWithFunctionWithTransclude': function () {
                var node = toDashed('directiveIsolatedScopeWithFunctionWithTransclude');
                return NodeBuilder.start(node).addAttr('fun','alienFun()')
                    .addContent('<ul><li>transcluded</li></ul>')
                    .end();
            },
            'directiveIsolatedScopeWithPrimitiveAndObjectWithTransclude': function() {
                var node = toDashed('directiveIsolatedScopeWithPrimitiveAndObjectWithTransclude');
                return NodeBuilder.start(node)
                    .addAttr('token','{{alienToken}}')
                    .addAttr('tokenobj', 'alienTokenObj')
                    .addContent('<div><input ng-model="token"><input ng-model="tokenObj.token"></div>')
                    .end();
            }
        };

        return {
            getScope : function (element) {
                return element.isolateScope() || element.scope();
            },
            getScopeId: function (element) {
                return this.getScope(element).$id;
            },
            createDirective: function (type, scope, content) {
                var htmlType = toDashed(type);
                var transcludeMarker = 'WithTransclude';
                var tpl;
                if(htmlTemplates[type]) {
                    tpl = htmlTemplates[type]();
                } else {
                    if(type.substr(type.length-transcludeMarker.length) === transcludeMarker) {
                        tpl = NodeBuilder.start(htmlType).addContent(content || '<ul><li>transcluded</li></ul>').end();
                    } else {
                        tpl = '<' + htmlType + '/>';
                    }
                }
                var el = angular.element(tpl);
                var element = $compile(el)(scope);
                angular.element(document.body).append(element);
                scope.$digest();
                return element;
            }
        };
    }]);
})();