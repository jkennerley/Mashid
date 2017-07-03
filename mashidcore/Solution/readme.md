** ASP.NET Core
  1996 ASP , Classic ASP
  2002 ASP.NET : WebForms, viewState and stateful, hiding details of html. code behind aand testability, page lifecycle difficulties
  2009 ASP MVC  : complete control of html, mvc, better unit testing
   MVC Dependency on IIS, System.Web, .Net framework
  2016 : asp.net core, cross platform .net for Linux, Macosx , not tied to System.Web,
   MVC & WebAPI is now MVC, DI is now core feature , 
   modular request pipeline and middleware, 
   nuget, everything is package and nuget manages packages
   designed for cloud,
   IIS or self-host, open source and cross-platform


** Tooling
  VS ::  https://www.visualstudio.com/downloads/
  .Net Core tooling :  https://www.microsoft.com/net
  Power Tools : https://marketplace.visualstudio.com/items?itemName=VisualStudioProductTeam.ProductivityPowerPack2017
  Browser : 
  VSCode. : 


** Start Solution 
  File New Project; 
  ASP.NET Core ; 
  You can choose empty


** Project Structure
  Note : previous src/test folders where invisaged but now this is not enforced
  src/test/documenttion files ? 
  wwwroot is root of the site, files contain js/html and bin files go outside this. There is separaation betwwwn the .net and web client web files.

** global.json vs csproj
   global.json, is where to find the projects in the solution.


** Project.json vs csproj
  R.I.P. project.json is now the csproj https://www.stevejgordon.co.uk/project-json-replaced-by-csproj


Review VS2017 : 
	
 https://github.com/dotnet/corefx/blob/master/Documentation/coding-guidelines/coding-style.md#c-coding-style
 https://github.com/dotnet/codeformatter


Note : C7 Features
  C#7 Features : See http://www.c-sharpcorner.com/article/top-10-new-features-of-c-sharp-7-with-visual-studio-2017/


**Adding packages for Static files, MVC Razor Tools.

*** Add razor for intelisnese and support at design time for example for tag helpers

See,  https://www.nuget.org/packages/Microsoft.AspNetCore.Razor.Tools/
Install-Package Microsoft.AspNetCore.Razor.Tools -Pre -ProjectName Mashid

// see https://www.nuget.org/packages/Microsoft.AspNetCore/1.1.1
Install-Package Microsoft.AspNetCore.StaticFiles -ProjectName Mashid

https://www.nuget.org/packages/Microsoft.AspNetCore.Mvc/
Install-Package Microsoft.AspNetCore.Mvc -ProjectName Mashid
// Not sure whether this is necessary since aspnetcore pulls in IIS integration, Install-Package Microsoft.AspNetCore.Server.IISIntegration -ProjectName Mashid





** Program.cs and Startup.cs
  Program.cs has main() function. 
  Main function instances a WebHostBuilder() and some config.
  The config incudes UseStartup<> to use class called Startup.
  UseKestrel, UseContentRoot() ,UseIISIntgerartion() are also typically configured.

  The web builder is then Run().

** Startup : Configure() and ConfigureServices()

The app starts
  main()
	new webHostBuilder()
	webHostBuilder.Run()
	-> Startup.ConfigureServices()
	-> Startup.Configure()
   http requsts are processed

** ConfigureServices servicesCollection
  services are created to IServiceCollection()
 
** Configure app env logger 
  services are created to IServiceCollection()











  




