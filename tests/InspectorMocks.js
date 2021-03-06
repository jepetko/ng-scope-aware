(function() {
	"use strict";
	
	var defaultDirectiveReturnValue = {
			'restrict' : 'AE',
			'replace': true,
			'template' : '<div>{{token}}<input ng-model="token"></div>'
	};

    var defaultDirectiveTranscludeReturnValue = {
        'restrict' : 'AE',
        'replace': true,
        'transclude': true,
        'template' : '<div>{{token}}<input ng-model="token"><p ng-transclude></p></div>'
    };

	angular.module('inspector-test-mocks', ['ngRoute'])
    .config( ['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/primitive', {
                template: '<input ng-model="primitive">'
            })
            .when('/object', {
                template: '<input ng-model="obj.key">'
            })
            .otherwise({redirectTo: '/index'});
        $locationProvider.html5Mode(true);
    }])
	.directive('directiveSharedScope', function() {
		return angular.extend({}, defaultDirectiveReturnValue);
	})
	.directive('directiveSharedScopeExplicit', function() {
		return angular.extend({'scope': false}, defaultDirectiveReturnValue);
	})
    .directive('directiveOwnScopeExplicitTrue', function() {
        return angular.extend({'scope': true}, defaultDirectiveReturnValue);
    })
    .directive('directiveOwnScopeExplicitTrueWithObject', function() {
        var retVal = angular.extend({'scope': true}, defaultDirectiveReturnValue);
        retVal.template = '<div>{{tokenobj.token}}<input ng-model="tokenobj.token"></div>';
        return retVal;
    })
	.directive('directiveIsolatedScope', function() {
		return angular.extend({'scope': {}}, defaultDirectiveReturnValue);
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
		retVal.template = '<div>{{tokenobj.token}}<input ng-model="tokenobj.token"></div>';
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
        return angular.extend({'scope': {}}, defaultDirectiveTranscludeReturnValue);
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
    })
    .directive('directiveIsolatedScopeWithPrimitiveAndObjectWithTransclude', function() {
        return {
            'restrict' : 'AE',
            'replace': true,
            'transclude': true,
            'scope': {
                'token': '@',
                'tokenobj': '='
            },
            'template' : '<div><div>{{token}}, {{tokenobj.token}}</div><div ng-transclude></div></div>'
        };
    })
    .controller('Ctrl', ['$scope', function($scope) {
        $scope.primitive = 'val';
        $scope.obj = { key : 'val' };
    }])
    .controller('SubCtrl',['$scope', function($scope) {
    }]);
})();