using Mashid.IRepository;
using Microsoft.AspNetCore.Mvc;

namespace Mashid.Controllers
{
 
    public class QuestionController : Controller
    {
        private readonly IMashidRepo _mashidRepo;

        public QuestionController(IMashidRepo mashidRepo)
        {
            this._mashidRepo = mashidRepo;
        }

        public ViewResult Questions()
        {
            this.ViewBag.Message = "Yo";

            var ret = 
                _mashidRepo
                .Questions();

            return View(ret);
        }
    }
}