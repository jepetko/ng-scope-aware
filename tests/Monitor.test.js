describe('Monitor', function() {
    "use strict";

    var Monitor;

    beforeEach(function() {
        module('scope-aware');
    });

    beforeEach(inject(function(_Monitor_) {
        Monitor = _Monitor_;
    }));

    describe('monitoring', function() {

        var obj = {}, num = 2, astring = 'hello', arr = [1,2,3,4];
        beforeEach(function() {
            obj.key1 = astring;
            obj.key2 = arr;
            obj.key3 = {'lara': 'croft', 'rocket':'groot'};
            obj.key4 = num;
        });

        it('is able to create the string representation of an array', function() {
            var str = '[0=1,1=2,2=3,3=4]';
            var objStr = Monitor.toString(arr);
            expect(str).toEqual(objStr);
        });

        it('is able to create the string representation of a string', function() {
            var str = 'hello';
            var objStr = Monitor.toString(astring);
            expect(str).toEqual(objStr);
        });

        it('is able to create the string representation of a number', function() {
            var str = '2';
            var objStr = Monitor.toString(num);
            expect(str).toEqual(objStr);
        });

        it('is able to create the string representation of an object', function() {
            var str = '{key1=hello;key2=[0=1,1=2,2=3,3=4];key3={lara=croft;rocket=groot};key4=2}';
            var objStr = Monitor.toString(obj);
            expect(str).toEqual(objStr);
        });
    });
});