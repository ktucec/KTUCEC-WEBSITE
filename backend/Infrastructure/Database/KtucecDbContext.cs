using ktucec.Domain.Entities;
using ktucec.Domain.Entities.Common;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Infrastructure.Database
{
    public class KtucecDbContext : DbContext
    {
        public KtucecDbContext(DbContextOptions<KtucecDbContext> options) : base(options)
        {
        }

        // ------ DB Table Definitions --------

        public DbSet<Announcement> Announcements => Set<Announcement>();
        public DbSet<Event> Events => Set<Event>();
        public DbSet<ContactForm> ContactForms => Set<ContactForm>();
        public DbSet<User> Users => Set<User>();

        // Form Tables
        public DbSet<Form> Forms => Set<Form>();
        public DbSet<FormApplication> FormApplications => Set<FormApplication>();
        public DbSet<FormQuestion> FormQuestions => Set<FormQuestion>();
        public DbSet<FormQuestionAnswer> FormQuestionAnswers => Set<FormQuestionAnswer>();

        // CODEWAVE Tables
        public DbSet<CodewaveStudentDiscount> CodewaveStudentDiscounts => Set<CodewaveStudentDiscount>();
        public DbSet<CodewaveApplication> CodewaveApplications => Set<CodewaveApplication>();
        public DbSet<CodewaveShopierOrder> CodewaveShopierOrders => Set<CodewaveShopierOrder>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Yeni form tablolarını doğrudan dbo şemasında tanımlıyoruz
            modelBuilder.Entity<Form>().ToTable("Forms", "dbo");
            modelBuilder.Entity<FormApplication>().ToTable("FormApplications", "dbo");
            modelBuilder.Entity<FormQuestion>().ToTable("FormQuestions", "dbo");
            modelBuilder.Entity<FormQuestionAnswer>().ToTable("FormQuestionAnswers", "dbo");

            // Cascade delete döngüsünü (cycle) engellemek için Restrict kuralı
            modelBuilder.Entity<FormQuestionAnswer>()
                .HasOne(fqa => fqa.FormQuestion)
                .WithMany(fq => fq.Answers)
                .HasForeignKey(fqa => fqa.FormQuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            // Bir kullanıcı silindiğinde başvuruları silinmez, UserId null'a çekilir (misafir başvurusu olarak kalır)
            modelBuilder.Entity<FormApplication>()
                .HasOne(fa => fa.User)
                .WithMany(u => u.FormApplications)
                .HasForeignKey(fa => fa.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            ConfigureCodewave(modelBuilder);
        }

        // -------- CODEWAVE --------
        private static void ConfigureCodewave(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CodewaveStudentDiscount>(e =>
            {
                e.ToTable("CodewaveStudentDiscounts", "dbo");

                e.Property(x => x.Email).HasMaxLength(254).IsRequired();
                e.Property(x => x.StudentNumber).HasMaxLength(15).IsRequired();
                e.Property(x => x.OtpCodeHash).HasMaxLength(64);
                e.Property(x => x.DiscountCode).HasMaxLength(20);
                e.Property(x => x.ShopierProductId).HasMaxLength(64);
                e.Property(x => x.ShopierProductUrl).HasMaxLength(512);
                e.Property(x => x.ShopierProductCode).HasMaxLength(24);
                e.Property(x => x.LastRequestIp).HasMaxLength(45);

                // Bir e-posta yalnızca bir kez indirim kazanabilir
                e.HasIndex(x => x.Email).IsUnique();

                // Kod yalnızca onaydan sonra oluşur; boş satırlar benzersizlik kuralına takılmaz
                e.HasIndex(x => x.DiscountCode).IsUnique().HasFilter("[DiscountCode] IS NOT NULL");
            });

            modelBuilder.Entity<CodewaveApplication>(e =>
            {
                e.ToTable("CodewaveApplications", "dbo");

                e.Property(x => x.FirstName).HasMaxLength(50).IsRequired();
                e.Property(x => x.LastName).HasMaxLength(50).IsRequired();
                e.Property(x => x.Email).HasMaxLength(254).IsRequired();
                e.Property(x => x.Phone).HasMaxLength(16).IsRequired();
                e.Property(x => x.PhoneKey).HasMaxLength(16).IsRequired();
                e.Property(x => x.City).HasMaxLength(60).IsRequired();
                e.Property(x => x.Language).HasMaxLength(2).IsRequired();
                e.Property(x => x.Currency).HasMaxLength(3).IsRequired();
                e.Property(x => x.DiscountCode).HasMaxLength(20);
                e.Property(x => x.ShopierProductUrl).HasMaxLength(512);

                e.Property(x => x.ListPrice).HasPrecision(10, 2);
                e.Property(x => x.DiscountAmount).HasPrecision(10, 2);
                e.Property(x => x.TotalPrice).HasPrecision(10, 2);
                e.Property(x => x.PaidAmount).HasPrecision(10, 2);
                e.Property(x => x.ShopierOrderId).HasMaxLength(64);

                e.HasIndex(x => x.Email);
                e.HasIndex(x => x.Status);
                e.HasIndex(x => x.PhoneKey);

                // İndirim kaydı silinirse başvuru kalır, yalnızca bağlantı kopar (kod metni DiscountCode'da durur)
                e.HasOne(x => x.CodewaveStudentDiscount)
                    .WithMany(d => d.Applications)
                    .HasForeignKey(x => x.CodewaveStudentDiscountId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<CodewaveShopierOrder>(e =>
            {
                e.ToTable("CodewaveShopierOrders", "dbo");

                e.Property(x => x.OrderId).HasMaxLength(64).IsRequired();
                e.Property(x => x.ProductId).HasMaxLength(64).IsRequired();
                e.Property(x => x.ProductTitle).HasMaxLength(200);
                e.Property(x => x.Total).HasPrecision(10, 2);
                e.Property(x => x.Currency).HasMaxLength(3);
                e.Property(x => x.BuyerFirstName).HasMaxLength(100);
                e.Property(x => x.BuyerLastName).HasMaxLength(100);
                e.Property(x => x.BuyerEmail).HasMaxLength(254);
                e.Property(x => x.BuyerPhone).HasMaxLength(32);
                e.Property(x => x.MatchMethod).HasMaxLength(16);
                e.Property(x => x.UnmatchedReason).HasMaxLength(32);

                // Aynı sipariş iki kez kaydedilemez
                e.HasIndex(x => x.OrderId).IsUnique();

                // Başvuru silinirse sipariş kaydı kalır, yalnızca bağlantı kopar
                e.HasOne(x => x.CodewaveApplication)
                    .WithMany()
                    .HasForeignKey(x => x.CodewaveApplicationId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }

        // -------- UpdatedAt override --------
        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries<BaseEntity>()
                .Where(e => e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}