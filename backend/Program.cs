using ktucec.Features.Announcements;
using ktucec.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using System;

var builder = WebApplication.CreateBuilder(args);


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<KtucecDbContext>(options =>
    options.UseSqlServer(connectionString));


builder.Services.AddScoped<AddAnnouncementHandler>();
builder.Services.AddScoped<GetAllAnnouncementsHandler>();
builder.Services.AddScoped<GetLatestAnnouncementsHandler>();
builder.Services.AddScoped<UpdateAnnouncementHandler>();
builder.Services.AddScoped<DeleteAnnouncementHandler>();


builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapAddAnnouncement();
app.MapGetAllAnnouncements();
app.MapGetLatestAnnouncements();
app.MapUpdateAnnouncement();
app.MapDeleteAnnouncement();

app.Run();