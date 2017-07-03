using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BethanysPieShop.Models;
using Mashid.IRepository;
using Mashid.Repository;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;


using Microsoft.AspNetCore.Mvc ;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;


namespace Mashid
{
    public class Startup
    {

        private IConfigurationRoot _configurationRoot;

        public Startup(IHostingEnvironment env)
        {

            this._configurationRoot = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json")
                .Build();// parse to key value pairs

        }


        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection servicesCollection)
        {
            // setup ef ctx inh. from DbContext 
            servicesCollection.AddDbContext<AppDbContext>( options => 
                options
                    .UseSqlServer(
                        _configurationRoot
                            .GetConnectionString("DefaultConnection")
                    )
            );

            // di
            servicesCollection.AddTransient<IMashidRepo, FakeMashidRepo>();

            // services.AddTransient<IPieRepository, MockPieRepository>();
            // services.AddTransient<ICategoryRepository, MockCategoryRepository>();
            servicesCollection.AddTransient<IPieRepository, PieRepository>();
            servicesCollection.AddTransient<ICategoryRepository, CategoryRepository>();

            // allows working with the context
            servicesCollection.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            // creates an object associated with the request
            // different for different request but the same within the request
            // a single shopping cart is associated with a request
            servicesCollection
                .AddScoped<ShoppingCart>( serviceProvider => 
                    ShoppingCart.GetCart( serviceProvider )
                );

            // add mvc 
            servicesCollection.AddMvc();

            // in-memory cache is enabled
            servicesCollection.AddMemoryCache();

            // session state
            servicesCollection.AddSession();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            //loggerFactory.AddConsole();
            //
            //if (env.IsDevelopment())
            //{
            //    app.UseDeveloperExceptionPage();
            //}
            //
            //app.Run(async (context) =>
            //{
            //    await context.Response.WriteAsync("Hello World!");
            //});

            // register some middleware components
            app.UseDeveloperExceptionPage(); // dev exception page
            app.UseStatusCodePages(); // text only headers

            app.UseStaticFiles(); // sere static files

            // add middle for session. Add before app.UseMvcWithDefaultRoute(), otherwise will not work
            app.UseSession();

            // very simple s route
            app.UseMvcWithDefaultRoute(); 

            // always invoke the seed methd on ap startup and seed thr db if necessary
            DbInitializer.Seed(app);
        }
    }
}
