using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities
{
    public class ContactForm: BaseEntity
    {
        public string NameSurname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
