using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities
{
    public class FormApplication : BaseEntity
    {
        public int FormId { get; set; }
        public Form Form { get; set; } = null!;

        public int? UserId { get; set; }
        public User? User { get; set; }

        public ICollection<FormQuestionAnswer> Answers { get; set; } = new List<FormQuestionAnswer>();
    }
}
