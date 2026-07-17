using Microsoft.EntityFrameworkCore;

namespace ktucec.Infrastructure.Database
{
    public class KtucecDbContext : DbContext
    {
        public KtucecDbContext(DbContextOptions<KtucecDbContext> options) : base(options)
        {
        }
    }
}
