using ktucec.Domain.Enums;
using ktucec.Features.Announcements;
using ktucec.Features.Auth;
using ktucec.Features.ContactForms;
using ktucec.Features.Events;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services;
using ktucec.Infrastructure.Services.Authentication;
using ktucec.Infrastructure.Services.Telegram;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<KtucecDbContext>(options =>
    options.UseSqlServer(connectionString));


builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // STRICT RATE LIMIT
    options.AddPolicy("StrictPolicy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown-strict-client",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 7,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }
        ));

    // FLEX RATE LIMIT
    options.AddPolicy("FlexPolicy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown-flex-client",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 45,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 2,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }
        ));

    // CONTACT-FORM RATE LIMIT
    options.AddPolicy("ContactPolicy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown-contact-client",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                Window = TimeSpan.FromHours(1),
                QueueLimit = 0
            }
        ));
});

// telegram service dependencies
builder.Services.AddHttpClient<TelegramService>();
builder.Services.AddScoped<TelegramService>();


builder.Services.AddScoped<PasswordHasher>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<JwtProvider>();



var jwtSecret = builder.Configuration["Jwt:Secret"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.ContainsKey("accessToken"))
                {
                    context.Token = context.Request.Cookies["accessToken"];
                }
                return Task.CompletedTask;
            }
        };
    });


// AUTHORIZATION POLICIES
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim(ClaimTypes.Role, UserRole.Admin.ToString()));

    options.AddPolicy("AdminAndManager", policy =>
        policy.RequireClaim(ClaimTypes.Role, UserRole.Admin.ToString(), UserRole.Manager.ToString()));
});

// CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
        });
});


// ----------- Service Registration --------------

// -- Annoucements --
builder.Services.AddScoped<AddAnnouncementHandler>();
builder.Services.AddScoped<GetAllAnnouncementsHandler>();
builder.Services.AddScoped<GetLatestAnnouncementsHandler>();
builder.Services.AddScoped<UpdateAnnouncementHandler>();
builder.Services.AddScoped<DeleteAnnouncementHandler>();

// -- Events --
builder.Services.AddScoped<AddEventHandler>();
builder.Services.AddScoped<UpdateEventHandler>();
builder.Services.AddScoped<DeleteEventHandler>();

// -- ContactForms -- 
builder.Services.AddScoped<AddContactFormHandler>();
builder.Services.AddScoped<InsertGetAllContactFormsHandler>();
builder.Services.AddScoped<DeleteContactFormHandler>();

// -- Authentication --
builder.Services.AddScoped<LoginHandler>();
builder.Services.AddScoped<VerifyCodeHandler>();
builder.Services.AddScoped<RefreshTokenHandler>();
builder.Services.AddScoped<LogoutHandler>();
builder.Services.AddScoped<CreateManagerHandler>();
builder.Services.AddScoped<UpdateManagerHandler>();
builder.Services.AddScoped<DeleteManagerHandler>();
builder.Services.AddScoped<GetAllManagersHandler>();


builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();


// ----------- Endpoint Mapping --------------

// -- Annoucements --
app.MapAddAnnouncement();
app.MapGetAllAnnouncements();
app.MapGetLatestAnnouncements();
app.MapUpdateAnnouncement();
app.MapDeleteAnnouncement();

// -- Events --
app.MapAddEvent();
app.MapUpdateEvent();
app.MapDeleteEvent();

// -- ContactForms --
app.MapAddContactForm();
app.MapGetAllContactForms();
app.MapDeleteContactForm();

// -- Authentication --
app.MapLogin();
app.MapVerifyCode();
app.MapRefreshToken();
app.MapLogout();
app.MapCreateManager();
app.MapUpdateManager();
app.MapDeleteManager();
app.MapGetAllManagers();


//await DatabaseSeeder.SeedAdminAsync(app);

app.Run();