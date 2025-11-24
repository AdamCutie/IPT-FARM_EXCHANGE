using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FarmExchange.Data;
using FarmExchange.Models;
using System.Security.Claims;

namespace FarmExchange.Controllers
{
    [Authorize]
    public class TransactionController : Controller
    {
        private readonly FarmExchangeDbContext _context;

        public TransactionController(FarmExchangeDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index(string? filter)
        {
            var userId = GetCurrentUserId();
            var profile = await _context.Profiles.FindAsync(userId);

            if (profile == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var query = _context.Transactions
                .Include(t => t.Harvest)
                .Include(t => t.Buyer)
                .Include(t => t.Seller)
                .AsQueryable();

            if (profile.UserType == UserType.Farmer)
            {
                query = query.Where(t => t.SellerId == userId);
            }
            else
            {
                query = query.Where(t => t.BuyerId == userId);
            }

            if (!string.IsNullOrEmpty(filter) && filter != "all")
            {
                query = query.Where(t => t.Status == filter);
            }

            var transactions = await query
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();

            ViewBag.Profile = profile;
            ViewBag.Filter = filter ?? "all";

            var stats = new
            {
                Total = transactions.Count,
                Pending = transactions.Count(t => t.Status == "pending"),
                Completed = transactions.Count(t => t.Status == "completed"),
                TotalRevenue = transactions.Where(t => t.Status == "completed").Sum(t => t.TotalPrice)
            };

            ViewBag.Stats = stats;

            return View(transactions);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateStatus(Guid id, string status)
        {
            var userId = GetCurrentUserId();
            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null || transaction.SellerId != userId)
            {
                return RedirectToAction("Index");
            }

            transaction.Status = status;
            await _context.SaveChangesAsync();

            TempData["Success"] = "Transaction status updated successfully!";
            return RedirectToAction("Index");
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}
