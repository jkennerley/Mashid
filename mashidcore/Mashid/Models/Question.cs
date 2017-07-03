using System;

namespace Mashid.Models
{

    public class Question
    {
        public Guid Id { get; set; }

        public string Text { get; set; }

        public string Answer { get; set; }

        public decimal Price { get; set; }

        public virtual QuestionCategory Category { get; set; }

        public Question(Guid id, string text, string answer)
        {
            Id = id;
            Text = text;
            Answer = answer;

            Category = new QuestionCategory{ Id = Guid.NewGuid()};

        }
    }
}