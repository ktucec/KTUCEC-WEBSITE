using System.Net.Http;
using Microsoft.Extensions.Configuration;

namespace ktucec.Infrastructure.Services;

public class TelegramService
{
    private readonly HttpClient _httpClient;
    private readonly string _botToken;
    private readonly string _chatId;

    public TelegramService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _botToken = configuration["Telegram:BotToken"] ?? string.Empty;
        _chatId = configuration["Telegram:ChatId"] ?? string.Empty;
    }

    public async Task SendMessageAsync(string message)
    {
        if (string.IsNullOrEmpty(_botToken) || string.IsNullOrEmpty(_chatId))
            return;

        // Telegram Bot API sendMessage URL'i
        var url = $"https://api.telegram.org/bot{_botToken}/sendMessage?chat_id={_chatId}&text={Uri.EscapeDataString(message)}";

        // HTTP Post ile Telegram sunucularına mesajı ateşliyoruz
        await _httpClient.PostAsync(url, null);
    }
}