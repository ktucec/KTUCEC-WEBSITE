using Microsoft.AspNetCore.Http;
using SkiaSharp;

namespace ktucec.Infrastructure.Services.Media;

public class ImageService
{
    // Resizes the given image according to its type and saves it to wwwroot.
    // Returns the relative path (e.g. "/uploads/profiles/xxxx.jpg") to be stored in the DB.
    public async Task<string> UploadImageAsync(IFormFile image, string type)
    {
        if (image == null || image.Length == 0)
            throw new ArgumentException("The uploaded file is empty.");

        // Map the type to its target folder and target height.
        var (folderName, targetHeight) = type.ToLowerInvariant() switch
        {
            "profile" => ("profiles", 720),
            "event" => ("events", 1080),
            _ => throw new ArgumentException($"Unknown image type: {type}")
        };

        var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();
        if (fileExtension != ".png" && fileExtension != ".jpg" && fileExtension != ".jpeg")
            throw new ArgumentException("Only .png, .jpg or .jpeg files are allowed.");

        // Generate a random file name to avoid collisions and overwrite issues.
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        var relativePath = Path.Combine("uploads", folderName, uniqueFileName);
        var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);

        // Ensure the target directory exists before writing the file.
        var directoryPath = Path.GetDirectoryName(physicalPath)!;
        if (!Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }

        using var fileStream = image.OpenReadStream();
        using var originalBitmap = SKBitmap.Decode(fileStream);

        if (originalBitmap == null)
            throw new Exception("Could not decode the image format.");

        // Scale down to the target height while preserving aspect ratio.
        // If the original image is already smaller than the target, keep it as is (no upscaling).
        int finalTargetHeight = Math.Min(originalBitmap.Height, targetHeight);
        float ratio = (float)originalBitmap.Height / finalTargetHeight;
        int newWidth = (int)(originalBitmap.Width / ratio);

        var imageInfo = new SKImageInfo(newWidth, finalTargetHeight);

        using var resizedBitmap = originalBitmap.Resize(imageInfo, SKSamplingOptions.Default);
        if (resizedBitmap == null)
            throw new Exception("An error occurred while resizing the image.");

        // Keep PNG as PNG (for transparency), encode everything else as JPEG.
        var format = fileExtension == ".png" ? SKEncodedImageFormat.Png : SKEncodedImageFormat.Jpeg;

        using var skImage = SKImage.FromBitmap(resizedBitmap);
        using var data = skImage.Encode(format, 85);
        using var outputStream = new FileStream(physicalPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, true);
        using var dataStream = data.AsStream();

        await dataStream.CopyToAsync(outputStream);

        // Return only the relative path, to be stored as ImageUrl in the DB.
        return $"/{relativePath.Replace("\\", "/")}";
    }

    public void DeleteImage(string? relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl))
            return;

        var physicalPath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            relativeUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString())
        );

        if (File.Exists(physicalPath))
        {
            File.Delete(physicalPath);
        }
    }
}