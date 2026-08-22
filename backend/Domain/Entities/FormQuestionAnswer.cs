using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities
{
    public class FormQuestionAnswer : BaseEntity
    {
        public int FormApplicationId { get; set; }
        public FormApplication FormApplication { get; set; } = null!;

        public int FormQuestionId { get; set; }
        public FormQuestion FormQuestion { get; set; } = null!;

        public string Value { get; set; } = string.Empty;
    }
}
