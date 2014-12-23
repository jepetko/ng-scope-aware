(function() {
	"use strict";
	
	angular.module('scope-utils', [])
	.service('Inspector', ['$rootScope', function($rootScope) {
		
		var grabScopeData = function(anyScope, inheritedProps) {
			var cleanScope = {};
			for(var p in anyScope) {
				if(p.indexOf('$') === 0 || p === 'this'|| p === 'constructor') {
					continue;
				}
				if(!anyScope.hasOwnProperty(p)) {
					inheritedProps[p] = true;
				}
				cleanScope[p] = anyScope[p];				
			}
			return cleanScope;
		};
		
		var traverse = function(anyScope, visitor, lvl) {
			lvl = lvl || 0;
			var i=0, lvlStr = '', str = '';
			while(i < lvl) {
				lvlStr += '  ';
				i++;
			}
			str += lvlStr + '[+]-' + anyScope.$id + '\n';	
			var inheritedProps = {};
            var grabbedData = grabScopeData(anyScope,inheritedProps);
            if(typeof visitor === 'function') {
                visitor.apply(null,[anyScope.$id,grabbedData]);
            }
			var data = JSON.stringify(	grabbedData,
										function(key,val) { 
											if(typeof val === 'function') {
												var fun = val + '';
                                                var args = /\(.*\)/g.exec(fun)[0].replace(/^\(/g,'').replace(/\)$/g,'').split(',');
                                                return 'function(' + args.join(',') + ') { ... }';
											}
											return val;
										}, '   ');
			var pieces = data.split('\n');
			var formattedData = '';
			angular.forEach(pieces, function(value) {
				var inherited = /\s*"(\w+)"\s*\:/g.exec(value);
				var marker = '';
				if(inherited && inherited[1] && inheritedProps[inherited[1]]) {
					marker = ' <---- suspect: inherited property';
				}
				formattedData += lvlStr + ' |     ' + value + marker + '\n';
			});
			str += formattedData;
						
			if(typeof anyScope.$$childHead !== 'undefined') {
				var allChildren = [];
				var child = anyScope.$$childHead;
				while(child !== null) {
					allChildren.push(child);
					child = child.$$nextSibling;
				}
				angular.forEach(allChildren, function(value) {
					str += traverse(value,visitor,lvl+1);
				});
			}
			return str;
		};		
		
		return {
			inspect : function(visitor) {
				return traverse($rootScope,visitor);
			}
		};
	}]);
})();