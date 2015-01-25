angular.module('integration-example', [])
.run(function($templateCache) {
    var primitivesForm = '<input ng-model="itm">';
    $templateCache.put('primitives.form', primitivesForm);
    var objectsForm = '<input ng-model="itm.val">';
    $templateCache.put('objects.form', objectsForm);
})
.controller('MainCtrl', function($scope) {
    $scope.name = 'MainCtrl';
    $scope.items = [{'val' : 'A'}, {'val' : 'B'}, {'val': 'C'}];
})
.controller('SubCtrl', function($scope) {
    $scope.items = [{'val' : 'D'}, {'val' : 'E'}, {'val': 'A'}];
})
.controller('SubSubCtrl', function($scope, $templateCache) {
    $scope.items = ['A', 'B', 'C'];
})
.controller('MarkerCtrl', function($scope) {
    $scope.getDesc = function() {
        switch($scope.category) {
            case 'A':
                return 'very high';
            case 'B':
                return 'high';
            case 'C':
                return 'middle';
            case 'D':
                return 'low';
            case 'E':
                return 'very low';
            default:
                return 'unknown (category is "' + $scope.category + '")';
        }
    };
})
.directive('sharedMarker', function() {
    return {
        restrict: 'AE',
        controller: 'MarkerCtrl',
        template: '<span class="category {{category}}">{{getDesc()}}</span>'
    };
})
.directive('marker', function() {
    return {
        scope:  { category : '@' },
        restrict: 'AE',
        controller: 'MarkerCtrl',
        template: '<span class="category {{category}}">{{getDesc()}}</span>'
    };
});