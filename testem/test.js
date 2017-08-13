describe("add" , function(){

    it("returns 0 for '' " , function(){
        var ac = add('');
        expect(ac).toBe(0);
    })
    it("returns 0 for 'aa' " , function(){
        var ac = add('aa');
        expect(ac).toBe(0);
    })

    it("returns 0 for '' " , function(){
        var ac = add('');
        expect(ac).toBe(0);
    })
    it("returns 3 for '1' " , function(){
        var ac = add('1');
        expect(ac).toBe(1);
    })
    it("returns 3 for '1,2' " , function(){
        var ac = add('1,2');
        expect(ac).toBe(3);
    })

});

