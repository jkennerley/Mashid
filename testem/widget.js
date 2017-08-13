function add(xsString) {

    switch(true)
    {
        case typeof xsString === "string" : 
            var xs = xsString.split(",");
            if(xs.length === 0 )
            {
                return 0 ; 
            }
            var sum = xs.reduce(function (acc, x) {
                var i = parseInt(x, 10);
                i = i ? i : 0 ; 
                return acc + i;
            }, 0);
            return sum;
            break;

        default : 
            return 0 ; 
            break;
    }

}