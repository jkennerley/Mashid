using Mashid.IRepository;
using Mashid.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Mashid.Repository
{
    public class FakeMashidRepo : IMashidRepo
    {

        public IEnumerable<Question> Questions()
        {
            var xs =
                    new List<Question>()
                        {
                            new Question(Guid.NewGuid() , "aa" , "a2"),
                            new Question(Guid.NewGuid() , "b1" , "b2"),
                            new Question(Guid.NewGuid() , "c1" , "c2"),
                            new Question(Guid.NewGuid() , "d1" , "d2"),
                        }
                    .AsEnumerable();

            return xs;
        }

        //public IEnumerable<Category> Categories()
        //{
        //    var xs =
        //        new List<Category>()
        //        .AsEnumerable()
        //        ;
        //
        //    return xs;
        //}
        //
        //public QItem QItemById(Guid id)
        //{
        //    //var xs =
        //    //    new List<QItem>()
        //    //    .AsEnumerable()
        //    //    .FirstOrDefault()
        //    //    ;
        //
        //    var xs =
        //        new List<QItem>()
        //        {
        //            new QItem(Guid.NewGuid() , "aa" , "bb"),
        //        }
        //        .AsEnumerable()
        //        .FirstOrDefault()
        //        ;
        //
        //    return xs;
        //}

    }
}