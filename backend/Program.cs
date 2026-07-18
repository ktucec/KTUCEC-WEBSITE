using ktucec.Features.Announcements;
using ktucec.Features.Events;
using ktucec.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using System;

var builder = WebApplication.CreateBuilder(args);


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<KtucecDbContext>(options =>
    options.UseSqlServer(connectionString));


// ----------- Service Registration --------------

// -- Annoucements --
builder.Services.AddScoped<AddAnnouncementHandler>();
builder.Services.AddScoped<GetAllAnnouncementsHandler>();
builder.Services.AddScoped<GetLatestAnnouncementsHandler>();
builder.Services.AddScoped<UpdateAnnouncementHandler>();
builder.Services.AddScoped<DeleteAnnouncementHandler>();

// -- Events --
builder.Services.AddScoped<AddEventHandler>();


builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();


// ----------- Endpoint Mapping --------------

// -- Annoucements --
app.MapAddAnnouncement();
app.MapGetAllAnnouncements();
app.MapGetLatestAnnouncements();
app.MapUpdateAnnouncement();
app.MapDeleteAnnouncement();

// -- Events --
app.MapAddEvent();



app.Run();