using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FarmExchange.Data;
using FarmExchange.Models;
using System.Security.Claims;

namespace FarmExchange.Controllers
{
    [Authorize]
    public class HarvestController : Controller
    {
        private readonly FarmExchangeDbContext _context;

        public HarvestController(FarmExchangeDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Browse(string? search, string? category)
        {
            var query = _context.Harvests
                .Include(h => h.User)
                .Where(h => h.Status == "available" && h.QuantityAvailable > 0);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(h =>
                    h.Title.Contains(search) ||
                    h.Description!.Contains(search) ||
                    h.User.FullName.Contains(search));
            }

            if (!string.IsNullOrEmpty(category) && category != "all")
            {
                query = query.Where(h => h.Category == category);
            }

            var harvests = await query.OrderByDescending(h => h.CreatedAt).ToListAsync();

            var userId = GetCurrentUserId();
            var profile = await _context.Profiles.FindAsync(userId);
            ViewBag.Profile = profile;
            ViewBag.SearchTerm = search;
            ViewBag.CategoryFilter = category;

            return View(harvests);
        }

        [Authorize]
        public async Task<IActionResult> Manage()
        {
            var userId = GetCurrentUserId();
            var profile = await _context.Profiles.FindAsync(userId);

            if (profile?.UserType != UserType.Farmer)
            {
                return RedirectToAction("Index", "Dashboard");
            }

            var harvests = await _context.Harvests
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();

            return View(harvests);
        }

        [HttpGet]
        public IActionResult Create()
        {
            var userId = GetCurrentUserId();
            var profile = _context.Profiles.Find(userId);

            if (profile?.UserType != UserType.Farmer)
            {
                return RedirectToAction("Index", "Dashboard");
            }

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Harvest harvest)
        {
            var userId = GetCurrentUserId();
            var profile = await _context.Profiles.FindAsync(userId);

            if (profile?.UserType != UserType.Farmer)
            {
                return RedirectToAction("Index", "Dashboard");
            }

            harvest.Id = Guid.NewGuid();
            harvest.UserId = userId;
            harvest.Status = "available";
            harvest.CreatedAt = DateTime.UtcNow;
            harvest.UpdatedAt = DateTime.UtcNow;

            _context.Harvests.Add(harvest);
            await _context.SaveChangesAsync();

            return RedirectToAction("Manage");
        }

        [HttpGet]
        public async Task<IActionResult> Edit(Guid id)
        {
            var userId = GetCurrentUserId();
            var harvest = await _context.Harvests.FindAsync(id);

            if (harvest == null || harvest.UserId != userId)
            {
                return RedirectToAction("Manage");
            }

            return View(harvest);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Harvest harvest)
        {
            var userId = GetCurrentUserId();
            var existingHarvest = await _context.Harvests.FindAsync(harvest.Id);

            if (existingHarvest == null || existingHarvest.UserId != userId)
            {
                return RedirectToAction("Manage");
            }

            existingHarvest.Title = harvest.Title;
            existingHarvest.Description = harvest.Description;
            existingHarvest.Category = harvest.Category;
            existingHarvest.Price = harvest.Price;
            existingHarvest.Unit = harvest.Unit;
            existingHarvest.QuantityAvailable = harvest.QuantityAvailable;
            existingHarvest.ImageUrl = harvest.ImageUrl;
            existingHarvest.HarvestDate = harvest.HarvestDate;
            existingHarvest.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return RedirectToAction("Manage");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetCurrentUserId();
            var harvest = await _context.Harvests.FindAsync(id);

            if (harvest != null && harvest.UserId == userId)
            {
                _context.Harvests.Remove(harvest);
                await _context.SaveChangesAsync();
            }

            return RedirectToAction("Manage");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Purchase(Guid harvestId, decimal quantity)
        {
            var userId = GetCurrentUserId();
            var harvest = await _context.Harvests
                .Include(h => h.User)
                .FirstOrDefaultAsync(h => h.Id == harvestId);

            if (harvest == null || quantity <= 0 || quantity > harvest.QuantityAvailable)
            {
                TempData["Error"] = "Invalid purchase request";
                return RedirectToAction("Browse");
            }

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                HarvestId = harvestId,
                BuyerId = userId,
                SellerId = harvest.UserId,
                Quantity = quantity,
                TotalPrice = quantity * harvest.Price,
                Status = "pending",
                TransactionDate = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);

            harvest.QuantityAvailable -= quantity;
            if (harvest.QuantityAvailable == 0)
            {
                harvest.Status = "sold_out";
            }

            await _context.SaveChangesAsync();

            TempData["Success"] = "Purchase request submitted successfully!";
            return RedirectToAction("Browse");
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}
