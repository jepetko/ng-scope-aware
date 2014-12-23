(function() {
	"use strict";
	
	var defaultDirectiveReturnValue = {
			'restrict' : 'AE',
			'replace': true,
			'transclude': true,
			'template' : '<div>{{token}}<p ng-transclude></p></div>'
	};
	
	angular.module('scope-utils-mocks', [])
	.directive('directiveSharedScope', function() {
		return angular.extend({}, defaultDirectiveReturnValue);
	})
	.directive('directiveSharedScopeExpl', function() {
		return angular.extend({'scope': false}, defaultDirectiveReturnValue);
	})
	.directive('directiveIsolatedScope', function() {
		return angular.extend({'scope': true}, defaultDirectiveReturnValue);
	})
	.directive('directiveIsolatedScopeWithString', function() {
		return angular.extend({'scope' : {'token': '@'}}, defaultDirectiveReturnValue);
	})	
	.directive('directiveIsolatedScopeWithObject', function() {
		var dest = {
                        'scope':    {
                            'tokenobj': '='
                        }
					};
		var retVal = angular.extend(dest, defaultDirectiveReturnValue);
		retVal.template = '<div>{{tokenobj.token}}</div>';
		return retVal;
	})
	.directive('directiveIsolatedScopeWithFunction', function() {
		var dest = {
					'scope':    {
									'fun': '&'
								}
                    };
		var retVal = angular.extend(dest, defaultDirectiveReturnValue);
		retVal.template = '<div ng-click="fun()">{{token}}</div>';
		return retVal;
	});	
})();