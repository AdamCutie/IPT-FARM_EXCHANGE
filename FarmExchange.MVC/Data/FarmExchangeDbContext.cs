using Microsoft.EntityFrameworkCore;
using FarmExchange.Models;

namespace FarmExchange.Data
{
    public class FarmExchangeDbContext : DbContext
    {
        public FarmExchangeDbContext(DbContextOptions<FarmExchangeDbContext> options)
            : base(options)
        {
        }

        public DbSet<Profile> Profiles { get; set; }
        public DbSet<Harvest> Harvests { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Profile>(entity =>
            {
                entity.ToTable("Profiles");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.UserType).HasConversion<string>();
            });

            modelBuilder.Entity<Harvest>(entity =>
            {
                entity.ToTable("Harvests");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Category);

                entity.HasOne(e => e.User)
                    .WithMany(p => p.Harvests)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Message>(entity =>
            {
                entity.ToTable("Messages");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.SenderId);
                entity.HasIndex(e => e.RecipientId);

                entity.HasOne(e => e.Sender)
                    .WithMany(p => p.SentMessages)
                    .HasForeignKey(e => e.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Recipient)
                    .WithMany(p => p.ReceivedMessages)
                    .HasForeignKey(e => e.RecipientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Harvest)
                    .WithMany(h => h.Messages)
                    .HasForeignKey(e => e.HarvestId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.ToTable("Transactions");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.BuyerId);
                entity.HasIndex(e => e.SellerId);
                entity.HasIndex(e => e.HarvestId);

                entity.HasOne(e => e.Harvest)
                    .WithMany(h => h.Transactions)
                    .HasForeignKey(e => e.HarvestId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Buyer)
                    .WithMany(p => p.BuyerTransactions)
                    .HasForeignKey(e => e.BuyerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Seller)
                    .WithMany(p => p.SellerTransactions)
                    .HasForeignKey(e => e.SellerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
