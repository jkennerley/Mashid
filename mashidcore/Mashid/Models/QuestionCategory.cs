using System;
using System.Collections.Generic;

namespace Mashid.Models
{
    public class QuestionCategory
    {
        public Guid Id { get; set; }

        public int  CategoryId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public List<Question> Questions{ get; set; }

        //public Category(Guid id, string qtext, string qanswer)
        //{
        //    Id = id;
        //    //QText = qtext;
        //    //QAnswer = qanswer;
        //}
    }
}