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
