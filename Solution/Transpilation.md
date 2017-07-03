# Transpilation

A 2017 client side development environment involves transpilation. Aiding client side development with an up to date JavaScript is easier, if not essential in 2017.Client side development in TypeScript emables type checking of your code. Client side development is going to help broadening and controlling the reach of client side scripting, and protects the code base from the broad range of client side browser js engines.


The issue then, is the transpilation from modern form of JavaScript e.g. ES2015 and later back to an older version of JavaScript e.g. ES3(2009) or ES5 (2009). Probably, this year 2017 and most likely choice to trqnspile back to ES5, since this will reach the evergreeen browsers and IE11.

It may also involve transpilation of TypeScript, or Elm or Fable or many of the other transpiler languages, See https://github.com/jashkenas/coffeescript/wiki/list-of-languages-that-compile-to-js.

Node and NPM tooling can do this, as well as other very useful client side tasks.

If you don't know about Node and npm, then you should. 
Quickly, spend 10 minutes having a look at the Node and wikipedia site about Node then and come back here.
We are going to use Node to transpile.


### Why not Use Visual Studio and the installed Version of TypeScript ? 
The answer to this is a series of factlets :- 

+ The VS2017 delivers a version of TS which is currently 2.2m but was 2.1 in the original version of VS2017.

+  The latest version of TS is 2.3.4.

+  The MS VS 2017 team is a different team than the MS TypeScript teeam, with a different delivery frames which ar not ncessarily in step with the TypeScript delivery.
+ Which version of TS will give you next time you install VS2017, which version of TS is on the build server if any at all?
+ You may want to get on the latest version of TS
+ You may want to go back to paticular version of TS e.g ng4 development mmay involve  tie to TS2.2
+ VS 2017 has already tied itself and delivered 2 different versions of TS since update, 1,2 and 3 in a period of 3 months, did you know this?
+ The way, and the version of TS that VS compiles  .ts files, is little magical. Perhaps I meant to say MS Visual Studio makes it 'easy' for you to use TS. MS is changing the rules quickly with each patch of VS2017 while trying to catch-up and keep up with TS. Fairly soon after scratching the surface you may end up trying this, http://www.tomdupont.net/2013/09/typescript-on-your-build-server.html. This involves copying TypeScript files to source control and copying VS2012 build targets, advised by someone on the .08 point of TS!
+ Instead of being limited by the VS 2017 cadence of TypeScript, instead of having uncontrolled user xcopy package management, use node/npm to take away the uncontrolled magic of VS TS and be more in control of the transpilation. 



As well as transpilation, Node and npm are good for so many other tasks :-
 > client side package management : bower, npm, jspm.
 > Automation, Task Runners :  Grunt, Gulp, NPM scripts
 > minification : 
 



### Ingredients for the MS Visual Studio Dev.


+ install node, see https://nodejs.org/en/

+ installing node, will install npm tooling,

+ install npm Task Runner, see https://marketplace.visualstudio.com/items?itemName=MadsKristensen.NPMTaskRunner.

+ You may need to bump up the $PATH in External Web Tools, see https://github.com/dotnet-architecture/eShopOnContainers/wiki/06.-Setting-the-Web-SPA-application-up

+ Install VSCode. For various different reasons, you will probably end up putting HTML/CSS in ES2015 strings. It is better to have suntax hhtml/css hilighting for 
those backtick strings.
The best I have found for dealing with this is to view the files in VSCode and use the CTRL-K M trick in VS Code. Do this rather than install special packages or swap to WebStorm!

+ You can transpile .js and .ts file. There are lots of options and the favorotes are Babel, TypeScript, Tracuer, Elm.  Babel has many solid features, but TS has the simple advantage of being able to transpile ES2015 and Typescript files. Since you may wanting to code in TS and ES2015, reduce tooling by using the TS transpiler only. There may be a compelling reason to use both Babel tooling though ...

+ Moderen client side development is not just simply scripting.  Modern development is component development. This is delivering html-css-script packges. Hence having /Script folder is rather a misname, insted use /components folder.


+ For clarity, it is better to to separate the source ts and es2015 files from the transpiled out-files, hence a /components/source and a components/dist directory feels appropriate. 

+ it feels like it is better to keep all the components (html-css-js) files together in one place ie.  ONE /components directory. So have one components directory to keep any files that are intended for use by the Typescript or any other Babel transipler.

+  Since Babel does not transpile .ts files and TS does transpile .js and js files, it feels like we need a /components/sourceTS directory. and /components/sourceBabel directory. This will probably redice complexxity of the tsconfig and .babelrc files.


+ The Target out directories? Possibly we could swap to one or both TS and Babel, ans perhaps Elm and Fable transpilation, who knows?  We could transpile into one /components/dist for all transpilations or have separate /components/distTS and /components/dist-babel.  If we swap transpiler and transpile inot the same directories then the client html pages will not need to change. If we have different target out directories for each kind of transpilation, then then swapping to a differetnt transpiled file for the html client will be a more intentional thing with easier comparison bu tjs unit test. Therefor I am voting for differnt transpiler out directories as well. Hence /component/dist-ts and /component/dist-babel etc.  
Since TypeScript is getting there first, and it may be the only transpier we use it can plant its flag on /component/dist!


+ The directory sructure will be /components/source-ts and /components/dist-ts 

+ A tsconfig.json will be plaes in /components directory.
  TSCONFIG HERE
```
  {
    "compileOnSave": true,
    "include": [ "source-ts/**/*" ],
    "compilerOptions": {
        "outDir": "dist-ts",
        "allowJs": true,
        "declaration": false,
        "target": "es5",
        "allowUnreachableCode": false,
        "noFallthroughCasesInSwitch": true,
        "noImplicitReturns": true,
        "newLine": "CRLF",
        "removeComments": true,
        "sourceMap": true
    }
}
```

+ We need to switch off VS2017 transpilation. For this alter the csproj with 
 
    <TypeScriptCompileBlocked>false</TypeScriptCompileBlocked>


+ We need to switch on an npm task for TS transpilation. For this : 
- install node/npm; 
- node install to get package json; 
- put node on the build server ; 
- npm install TypeScript --save-dev ; or save-exact
a npm taks for --ver ; 
- ts-transpile,; 
- ts-transpile-watch ; 
- on opn of the proheject npm run install ; 
- on build run ts-transpile ; 
- use the tSX to view and review npm stuff ...;























