describe("UnitTestDemo",

    function() {

        // screenshot does not work in electron, https://github.com/wallabyjs/public/issues/1149
        it("screenshot for ALT-SHIFT-F10",
            function() {
                // with phantomjs ...
                console.log(new Date());
                const element = document.getElementsByTagName("body");
                console.log(element);
                console.log(element[0]);
                element[0].style.background = "#0ff";
                // try ALT-SHIFT-F10
            });

        // screenshot does not work in electron, https://github.com/wallabyjs/public/issues/1149
        it("screenshot for ALT-SHIFT-F10, Is FAILING IN Electron/V8",
            function() {
                // with electron ...
                console.log(new Date());
                const element = document.getElementsByTagName("body");
                console.log(element);
                console.log(element[0]);
                element[0].style.background = "#00a";
                // try ALT-SHIFT-F10
            });


        it("es2015 language feature  : const should work",
            function() {
                const a = true;
                //let a = 1; 
                expect(a).toBe(true);
            });

        it("es2015 language feature  : const should work",
            function () {
                //let a = 1; 
            });

        it("es2015 language feature  : const should work",
            function () {
                //let a = 1; 
            });


        it("es2015 language feature : const should work",
            function () {

                //var ph = phantom.version.major + '.';
                console.log(window.navigator.appCodeName);
                console.log(window.navigator.appName);
                console.log(window.navigator.appVersion);

                console.log(window.navigator.cookieEnabled);
                console.log(window.navigator.language);
                console.log(window.navigator.onLine);
                console.log(window.navigator.platform);

                console.log(window.navigator.userAgent);

        });

    });
