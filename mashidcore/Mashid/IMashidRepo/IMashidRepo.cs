using Mashid.Models;
using System;
using System.Collections.Generic;

namespace Mashid.IRepository
{
    public interface IMashidRepo
    {
        IEnumerable<Question> Questions();

        ///QItem QItemById(Guid id);
        ///
        ///IEnumerable<QItem> QItems();
        ///
        ///IEnumerable<Category> Categories();
        //Question  QItemById(Guid id);
        ///IEnumerable<Category> Categories();

    }
}