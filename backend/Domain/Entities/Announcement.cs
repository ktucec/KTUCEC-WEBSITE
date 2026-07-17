using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities
{
    public class Announcement : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}
