using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Web;
using System.Web.Mvc;

namespace Wc.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }


        public ActionResult WcHome()
        {
            return View();
        }

        public ActionResult SendTestEmail()
        {
            var smtpClient = new SmtpClient();

            var message = new MailMessage("john@acme.net", "john@acme.net")
            {
                Subject = "test email ...",
                Body = "test email ..."
            };

            smtpClient.Send(message);

            return View();
        }

    }
}