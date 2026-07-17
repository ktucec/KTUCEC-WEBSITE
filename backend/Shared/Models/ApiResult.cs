namespace ktucec.Shared.Models
{
    public record ApiResult<T>(bool IsSuccess, T? Data, string Message);
    public record ApiResult(bool IsSuccess, string Message);
}
