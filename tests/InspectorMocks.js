(function() {
	"use strict";
	
	var defaultDirectiveReturnValue = {
			'restrict' : 'AE',
			'replace': true,
			'template' : '<div>{{token}}</div>'
	};

    var defaultDirectiveTranscludeReturnValue = {
        'restrict' : 'AE',
        'replace': true,
        'transclude': true,
        'template' : '<div>{{token}}<p ng-transclude></p></div>'
    };
	
	angular.module('inspector-test-mocks', [])
	.directive('directiveSharedScope', function() {
		return angular.extend({}, defaultDirectiveReturnValue);
	})
	.directive('directiveSharedScopeExplicit', function() {
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
	})
    // with transclude
    .directive('directiveSharedScopeWithTransclude', function() {
        return angular.extend({}, defaultDirectiveTranscludeReturnValue);
    })
    .directive('directiveSharedScopeExplicitWithTransclude', function() {
        return angular.extend({'scope': false}, defaultDirectiveTranscludeReturnValue);
    })
    .directive('directiveIsolatedScopeWithTransclude', function() {
        return angular.extend({'scope': true}, defaultDirectiveTranscludeReturnValue);
    })
    .directive('directiveIsolatedScopeWithStringWithTransclude', function() {
        return angular.extend({'scope' : {'token': '@'}}, defaultDirectiveTranscludeReturnValue);
    })
    .directive('directiveIsolatedScopeWithObjectWithTransclude', function() {
        var dest = {
            'scope':    {
                'tokenobj': '='
            }
        };
        var retVal = angular.extend(dest, defaultDirectiveTranscludeReturnValue);
        retVal.template = '<div><div>{{tokenobj.token}}</div><p ng-transclude></p></div>';
        return retVal;
    })
    .directive('directiveIsolatedScopeWithFunctionWithTransclude', function() {
        var dest = {
            'scope':    {
                'fun': '&'
            }
        };
        var retVal = angular.extend(dest, defaultDirectiveTranscludeReturnValue);
        retVal.template = '<div><div ng-click="fun()">{{token}}</div><p ng-transclude></p></div>';
        return retVal;
    });
})();