using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities
{
    public class EventGalleryImage : BaseEntity
    {
        public int EventId { get; set; }
        public Event Event { get; set; } = null!;

        public string ImageUrl { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
    }
}