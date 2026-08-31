using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities
{
    public class Event : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateOnly Date { get; set; }
        public string Location { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }

        public string? Summary { get; set; }
        public string? ApplicationUrl { get; set; }
        public int? ParticipantCount { get; set; }

        public ICollection<EventGalleryImage> GalleryImages { get; set; } = new List<EventGalleryImage>();
    }
}