using Mashid.IRepository;
using Microsoft.AspNetCore.Mvc;

namespace Mashid.Controllers
{
 
    public class DemoBootstrapController : Controller
    {
        private readonly IMashidRepo _mashidRepo;

        public DemoBootstrapController(IMashidRepo mashidRepo)
        {
            this._mashidRepo = mashidRepo;
        }

        public ViewResult Index()
        {
            //this.ViewBag.Message = "Yo";

            var ret = 
                _mashidRepo
                .Questions();

            return View(ret);
        }
    }
}