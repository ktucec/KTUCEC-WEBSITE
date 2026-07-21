using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ktucec.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;

namespace ktucec.Infrastructure.Services.Authentication;

public class JwtProvider
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public JwtProvider(IConfiguration configuration, IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
    }

    // 15m access token
    public string GenerateAccessToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("ManagerRole", user.ManagerRole.ToString())
        };

        var secretKey = _configuration["Jwt:Secret"] ?? string.Empty;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15), 
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public (string Token, DateTime ExpiresAt) GenerateRefreshToken()
    {
        return (
            Token: Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N"),
            ExpiresAt: DateTime.UtcNow.AddDays(7)
        );
    }

    public void SetTokensInCookies(HttpContext context, string accessToken, string refreshToken, DateTime refreshExpiresAt)
    {
        var isSecure = !_environment.IsDevelopment();

        var accessOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = isSecure,
            SameSite = SameSiteMode.Lax,
            Expires = refreshExpiresAt
        };

        var refreshOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = isSecure,
            SameSite = SameSiteMode.Lax,
            Expires = refreshExpiresAt
        };

        context.Response.Cookies.Append("accessToken", accessToken, accessOptions);
        context.Response.Cookies.Append("refreshToken", refreshToken, refreshOptions);
    }

    public void ClearCookies(HttpContext context)
    {
        context.Response.Cookies.Delete("accessToken");
        context.Response.Cookies.Delete("refreshToken");
    }
}