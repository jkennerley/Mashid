console.log("{es3,1}");
//console.log("{es5,2}");
//console.log("{es2015,3}");

interface IWidget {
    foo(): string;
}

class Widget implements IWidget{

    constructor(private forname: string) {
    }

    private privFoo() {
        return "privFoo";
    }

    private privFoo2 = () => "privFoo";

    public foo() {
        return "foo";
    }

    public foo2 = () => "foo";


    name() {
        return this.forname;
    }

    static Create(forename: string = ""): Widget {
        return new Widget(forename);
    }
}