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