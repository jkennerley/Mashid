//describe("demo screenshot",
//    function() {
//        // // works fine when with phantomejs "-XX-env": { "kind": "electron" }
//        // it("screenshot-with-phantom-ok", function () {
//        //     // with phantom ...
//        //     var element = document.getElementsByTagName("body");
//        //     element[0].style.background = '#500';
//        // ALT-SHIFT-F10 never always yields coloured bgnd
//        // });
//
//        // does not work fine when with electron"env": { "kind": "electron" }
//        it("screenshot-with-electron-not-ok",
//            function() {
//                //const x = 1; // es2015(es6) will work with electron
//                // with electron ...
//                const element = document.getElementsByTagName("body");
//                element[0].style.background = "#550";
//                // ALT-SHIFT-F10 never yields coloured bgnd
//            });
//
//        // https://github.com/wallabyjs/public/issues/1149
//    });