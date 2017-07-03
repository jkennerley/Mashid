using System.Web.Mvc;

namespace Wc.Controllers
{
    public class WcController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult CustomElementsApiAndLifecyle()
        {
            // Wc0001
            return View();
        }

        public ActionResult ExtendingWithMethodsOnCustomeElements()
        {
            // wc0003
            return View();
        }

        public ActionResult ExtendingNativeElements()
        {
            // wc004
            //extending native elements
            return View();
        }

        public ActionResult UsingShadowDomBasics()
        {
            // wc005
            return View();
        }

        public ActionResult UsingHtmlTemplates()
        {
            // wc006
            return View();
        }


        public ActionResult UsingHtmlImports()
        {
            // wc007
            return View();
        }

        public ActionResult WCMethod1JS()
        {
            // WC by Javascript only
            return View();
        }

        public ActionResult WCMethod2HTMLImport()
        {
            // WC by HTMLImport of html file 
            return View();
        }

        public ActionResult WCMethod2HTMLImportExperiment()
        {
            // WC by HTMLImport of html file 
            return View();
        }

        public ActionResult MyComponent()
        {
            return View();
        }

        public ActionResult StarRating()
        {
            return View();
        }

        public ActionResult SlideMenu()
        {
            return View();
        }


    }
}