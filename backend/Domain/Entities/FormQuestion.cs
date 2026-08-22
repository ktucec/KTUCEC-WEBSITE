using ktucec.Domain.Entities.Common;
using ktucec.Domain.Enums;

namespace ktucec.Domain.Entities
{
    public class FormQuestion : BaseEntity
    {
        public int FormId { get; set; }
        public Form Form { get; set; } = null!;

        public string Label { get; set; } = string.Empty;
        public string Placeholder { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public bool IsRequired { get; set; }
        public int Order { get; set; }

        public string OptionsJson { get; set; } = string.Empty;

        public string MappedUserField { get; set; } = string.Empty;

        public ICollection<FormQuestionAnswer> Answers { get; set; } = new List<FormQuestionAnswer>();
    }
}
