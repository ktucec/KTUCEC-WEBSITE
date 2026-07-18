using ktucec.Features.Announcements;
using ktucec.Features.ContactForms;
using ktucec.Features.Events;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System;

var builder = WebApplication.CreateBuilder(args);


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<KtucecDbContext>(options =>
    options.UseSqlServer(connectionString));


// activate memorycache for rate limiting
builder.Services.AddMemoryCache();

// telegram service dependencies
builder.Services.AddHttpClient<TelegramService>();
builder.Services.AddScoped<TelegramService>();


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
app.MapUpdateEvent();
app.MapDeleteEvent();

// -- ContactForms --
app.MapAddContactForm();
app.MapGetAllContactForms();


app.Run();