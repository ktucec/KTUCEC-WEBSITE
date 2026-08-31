namespace ktucec.Application.Common.Helpers
{
    public static class SlugHelper
    {
        private static readonly Dictionary<char, char> TurkishMap = new()
        {
            {'ç','c'}, {'Ç','c'}, {'ğ','g'}, {'Ğ','g'},
            {'ı','i'}, {'I','i'}, {'İ','i'}, {'ö','o'},
            {'Ö','o'}, {'ş','s'}, {'Ş','s'}, {'ü','u'}, {'Ü','u'}
        };

        public static string GenerateSlug(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            var chars = input.Select(c => TurkishMap.TryGetValue(c, out var mapped) ? mapped : c);
            var normalized = new string(chars.ToArray()).ToLowerInvariant();

            normalized = System.Text.RegularExpressions.Regex.Replace(normalized, @"[^a-z0-9\s-]", "");
            normalized = System.Text.RegularExpressions.Regex.Replace(normalized, @"\s+", "-").Trim('-');
            normalized = System.Text.RegularExpressions.Regex.Replace(normalized, @"-+", "-");

            return normalized;
        }
    }
}