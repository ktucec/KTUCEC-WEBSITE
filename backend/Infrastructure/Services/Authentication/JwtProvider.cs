using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ktucec.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ktucec.Infrastructure.Services.Authentication;

public class JwtProvider
{
    private readonly IConfiguration _configuration;

    public JwtProvider(IConfiguration configuration)
    {
        _configuration = configuration;
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

    // refresh token generator
    public (string Token, DateTime ExpiresAt) GenerateRefreshToken()
    {
        return (
            Token: Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N"),
            ExpiresAt: DateTime.UtcNow.AddDays(7)
        );
    }

    // set token to the httponly cookie
    public void SetTokensInCookies(HttpContext context, string accessToken, string refreshToken, DateTime refreshExpiresAt)
    {
        var accessOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddMinutes(15)
        };

        var refreshOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = refreshExpiresAt
        };

        context.Response.Cookies.Append("accessToken", accessToken, accessOptions);
        context.Response.Cookies.Append("refreshToken", refreshToken, refreshOptions);
    }

    // delete cookies when user quit
    public void ClearCookies(HttpContext context)
    {
        context.Response.Cookies.Delete("accessToken");
        context.Response.Cookies.Delete("refreshToken");
    }
}