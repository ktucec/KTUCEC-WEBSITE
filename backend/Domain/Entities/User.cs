using ktucec.Domain.Entities.Common;
using ktucec.Domain.Enums;

namespace ktucec.Domain.Entities;

public class User : BaseEntity
{
    public string ProfileUrl { get; set; } = string.Empty;
    public string NameSurname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // Role 
    public UserRole Role { get; set; } = UserRole.Member;
    public ManagerRole ManagerRole { get; set; } = ManagerRole.None;

    // First validation for all role types
    public bool IsEmailConfirmed { get; set; } = false;
    public string? EmailConfirmationToken { get; set; }
    public DateTime? EmailConfirmationTokenExpiresAt { get; set; }

    // 2fa system for admin and manager roles
    public string? LoginOtpCode { get; set; }
    public DateTime? LoginOtpCodeExpiresAt { get; set; }

    // Refresh token
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }

}