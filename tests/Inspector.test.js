describe('Inspector', function() {
	
	"use strict";
	
	var $rootScope, $scope, $compile, Inspector;
	
	var scopeEmulations = (function() {
		
		var toCamelCase = function(str) {
			if(typeof str === 'undefined') {
				return str;
			}
			var pieces = str.split(/\-/g);
			var result;
			angular.forEach(pieces, function(val) {				
				if(typeof result === 'undefined') {
					result = val.toLowerCase();
				} else {
					result += val.charAt(0).toUpperCase() + val.slice(1);
				}
			});
			return result;
		};
		
		var toDashed = function(str) {
			if(typeof str === 'undefined') {
				return str;
			}
			var result = '';
			for(var i=0;i<str.length;i++) {
				var ch = str.charCodeAt(i);
				if(ch >= 65 && ch <= 90) {
					result += '-' + str.charAt(i).toLowerCase();
				} else {
					result += str.charAt(i);
				}				
			}
			return result;
		};
		
		var htmlTemplates = {
			'directiveIsolatedScopeWithString' : function() {
				var node = toDashed('directiveIsolatedScopeWithString');
				return '<' + node + ' token="{{alienToken}}"/>'; 
			},
			'directiveIsolatedScopeWithObject' : function() {
				var node = toDashed('directiveIsolatedScopeWithObject');
				return '<' + node + ' tokenobj="alienTokenObj"/>';
			},
			'directiveIsolatedScopeWithFunction' : function() {
				var node = toDashed('directiveIsolatedScopeWithFunction');
                return '<' + node + ' fun="alienFun()"/>';
			}
		};
		
		return {
			directive : function(type, scope) {
				var tpl = htmlTemplates[type] ? htmlTemplates[type]() : '<' + toDashed(type) + '/>';
				var element = $compile(tpl)(scope);
				scope.$digest();

				return element;
			}
		};
	})();
	
	beforeEach(function() {
		module('scope-utils-mocks');
		module('scope-utils');		
	});
	
	beforeEach(inject(function(_$rootScope_, _$compile_, _Inspector_) {
		$rootScope = _$rootScope_;
		$scope = $rootScope.$new();

		$scope.alienToken = '12345';
		$scope.alienTokenObj = { token : '6789' };
		$scope.alienFun = function() {
			console.log('>> alienFun');
		};
		
		$compile = _$compile_;
		Inspector = _Inspector_;
	}));
	
	describe('scopeEmulations', function() {
		
		angular.forEach(['directiveSharedScope','directiveSharedScopeExpl','directiveIsolatedScope',
                        'directiveIsolatedScopeWithString', 'directiveIsolatedScopeWithObject',
                        'directiveIsolatedScopeWithFunction'], function(value) {
			it('should create a directive ' + value, (function(val) {
			
				return function() {
                    var element = scopeEmulations.directive(value, $scope);
                    expect(element).toBeDefined();
                    expect(element.scope()).toBeDefined();
                };
			})(value));
		});		
	});
	
	describe('features', function() {

		it('should print scope hierarchy', function() {
						
			scopeEmulations.directive('directiveSharedScope', $scope);	
			scopeEmulations.directive('directiveSharedScopeExpl', $scope);
			
			scopeEmulations.directive('directiveIsolatedScope', $scope);
			scopeEmulations.directive('directiveIsolatedScopeWithString', $scope);
			scopeEmulations.directive('directiveIsolatedScopeWithFunction', $scope);
			
			var nestedDirectives = '<directive-isolated-scope-with-string token="{{alienToken}}">' +
                                    '<directive-isolated-scope-with-object tokenobj="alienTokenObj">' +
                                        '<directive-isolated-scope-with-function fun="alienFun()">hello</directive-isolated-scope-with-function>' +
                                    '</directive-isolated-scope-with-object>' +
                                   '</directive-isolated-scope-with-string>';
						
			var element = $compile(nestedDirectives)($scope);
			$scope.$digest();
			
			var result = Inspector.inspect();
            console.log(result);
		});
	});
});