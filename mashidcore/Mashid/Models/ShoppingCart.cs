using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BethanysPieShop.Models
{
    public class ShoppingCart
    {
        private readonly AppDbContext _appDbContext;

        private ShoppingCart(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public string ShoppingCartId { get; set; }
        public List<ShoppingCartItem> ShoppingCartItems { get; set; }

        public static ShoppingCart GetCart(IServiceProvider serviceProvider)
        {
            // get access to the session servicesProvider
            var session =
                serviceProvider
                    .GetRequiredService<IHttpContextAccessor>()
                    ?
                    .HttpContext
                    .Session;

            // get app db context
            var appDbcontext =
                serviceProvider
                    .GetService<AppDbContext>();

            // get cart id, if not then get a new one
            var cartId =
                session.GetString("CartId")
                ?? Guid.NewGuid().ToString();

            // set the session cartId
            session.SetString("CartId", cartId);

            //
            return
                new ShoppingCart(appDbcontext)
                {
                    ShoppingCartId = cartId
                };
        }

        public void AddToCart(Pie pie, int amount)
        {
            // add pie and amoutn of pie
            var shoppingCartItem =
                _appDbContext
                    .ShoppingCartItems
                    .SingleOrDefault(
                        s => s.Pie.PieId == pie.PieId && s.ShoppingCartId == ShoppingCartId);

            // ensure shopping cartitem to dbContext
            if (shoppingCartItem == null)
            {
                shoppingCartItem = new ShoppingCartItem
                {
                    ShoppingCartId = ShoppingCartId,
                    Pie = pie,
                    Amount = 1
                };

                _appDbContext
                    .ShoppingCartItems
                    .Add(shoppingCartItem);
            }
            else
            {
                shoppingCartItem.Amount++;
            }

            // save changes ...
            _appDbContext.SaveChanges();
        }

        public int RemoveFromCart(Pie pie)
        {
            var shoppingCartItem =
                _appDbContext
                    .ShoppingCartItems
                    .SingleOrDefault(
                        s => s.Pie.PieId == pie.PieId && s.ShoppingCartId == ShoppingCartId);

            var localAmount = 0;

            if (shoppingCartItem != null)
                if (shoppingCartItem.Amount > 1)
                {
                    shoppingCartItem.Amount--;
                    localAmount = shoppingCartItem.Amount;
                }
                else
                {
                    _appDbContext.ShoppingCartItems.Remove(shoppingCartItem);
                }

            _appDbContext.SaveChanges();

            return localAmount;
        }

        public List<ShoppingCartItem> GetShoppingCartItems()
        {
            return ShoppingCartItems ??
                   (ShoppingCartItems =
                       _appDbContext.ShoppingCartItems.Where(c => c.ShoppingCartId == ShoppingCartId)
                           .Include(s => s.Pie)
                           .ToList());
        }

        public void ClearCart()
        {
            var cartItems = _appDbContext
                .ShoppingCartItems
                .Where(cart => cart.ShoppingCartId == ShoppingCartId);

            _appDbContext.ShoppingCartItems.RemoveRange(cartItems);

            _appDbContext.SaveChanges();
        }

        public decimal GetShoppingCartTotal()
        {
            var total = _appDbContext.ShoppingCartItems.Where(c => c.ShoppingCartId == ShoppingCartId)
                .Select(c => c.Pie.Price * c.Amount)
                .Sum();
            return total;
        }
    }
}