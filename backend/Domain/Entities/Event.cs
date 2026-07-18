using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities
{
    public class Event : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateOnly Date { get; set; }
        public string Location { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }
}
