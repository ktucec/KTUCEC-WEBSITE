using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities
{
    public class Form : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public ICollection<FormQuestion> Questions { get; set; } = new List<FormQuestion>();
        public ICollection<FormApplication> Applications { get; set; } = new List<FormApplication>();
    }
}
