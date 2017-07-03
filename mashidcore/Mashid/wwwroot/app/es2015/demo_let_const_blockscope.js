'use strict'; 

// //-- Start
// console.log("demo_let_const_blockscope.js start");
// 
// // to demo es2015, you could include thi file on a web page
// // But,  you can alos use wallaby and use electron rather than phantomjs
// // https://wallabyjs.com/docs/integration/electron.html
// 
// // the document element is passed to the event handler
// // cannot get access to the context of the function
// // in this place, window is the context of the function
// document.addEventListener('click', function (a) {
//     console.log("add event listner 1 :: ");
//     console.log(this);
//     console.log(a);
// });
// 
// // the window element is this handler
// // the context of the function is window not document
// document.addEventListener('click', (a) => {
//     console.log("add event listner 2 :: ");
//     console.log(this);
//     console.log(a);
// });
// 
// //--END
// console.log("demo_let_const_blockscope.js end");
