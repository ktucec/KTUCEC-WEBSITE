<#
  Shopier API test scripti (siparis + webhook + urun).
  Kullanim (PowerShell):
    .\shopier-test.ps1 -What orders                     # son 60 gunun siparisleri
    .\shopier-test.ps1 -What orders -Days 7 -Email a@b.com
    .\shopier-test.ps1 -What order -Id 123456           # tek siparis
    .\shopier-test.ps1 -What product -Id 50538931       # urun (stok vs.)
    .\shopier-test.ps1 -What webhooks                   # kayitli webhooklar
    .\shopier-test.ps1 -What webhook-create -Url https://api.ktucec.com/api/codewave/internal/shopier-webhook
    .\shopier-test.ps1 -What webhook-delete -Id <webhookId>
  Token: $env:SHOPIER_TOKEN yoksa gizli olarak sorar. Token'i dosyaya YAZMA, git'e koyma.
  Ham yanitlar .\shopier-out\ klasorune kaydedilir (icinde alici bilgisi olur, paylasmadan once maskele).
#>
param(
    [Parameter(Mandatory)][ValidateSet('orders','order','product','webhooks','webhook-create','webhook-delete')]
    [string]$What,
    [string]$Id,
    [int]$Days = 60,
    [string]$Email,
    [string]$ProductId,
    [int]$Page = 1,
    [int]$Limit = 50,
    [string]$Url,
    [string[]]$Events = @('order.created','order.fulfilled','refund.requested'),
    [string]$Base = 'https://api.shopier.com/v1'
)

$token = $env:SHOPIER_TOKEN
if (-not $token) {
    $sec = Read-Host 'Shopier PAT' -AsSecureString
    $token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}
$headers = @{ Authorization = "Bearer $token"; Accept = 'application/json' }
New-Item -ItemType Directory -Force -Path .\shopier-out | Out-Null

function Call($method, $path, $body) {
    $uri = "$Base$path"
    Write-Host "`n$method $uri" -ForegroundColor Cyan
    try {
        $p = @{ Method = $method; Uri = $uri; Headers = $headers; UseBasicParsing = $true }
        if ($body) { $p.Body = ($body | ConvertTo-Json -Depth 6); $p.ContentType = 'application/json' }
        $r = Invoke-WebRequest @p
        Write-Host "HTTP $($r.StatusCode)" -ForegroundColor Green
        $r.Headers.GetEnumerator() | Where-Object { $_.Key -match 'pagination|ratelimit|retry' } |
            ForEach-Object { Write-Host ("  {0}: {1}" -f $_.Key, ($_.Value -join ',')) }
        $file = ".\shopier-out\{0}-{1}.json" -f $What, (Get-Date -Format 'yyyyMMdd-HHmmss')
        $r.Content | Out-File -Encoding utf8 $file
        Write-Host "Ham yanit: $file"
        if ($r.Content) { return ($r.Content | ConvertFrom-Json) }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $msg = $_.ErrorDetails.Message
        if (-not $msg -and $_.Exception.Response) {
            try { $msg = (New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch {}
        }
        Write-Host "HATA HTTP ${status}: $msg" -ForegroundColor Red
    }
}

switch ($What) {
    'orders' {
        $q = @("limit=$Limit", "page=$Page",
               "dateStart=" + [uri]::EscapeDataString((Get-Date).AddDays(-$Days).ToString('o')),
               "dateEnd="   + [uri]::EscapeDataString((Get-Date).ToString('o')))
        if ($Email)     { $q += "customerEmail=" + [uri]::EscapeDataString($Email) }
        if ($ProductId) { $q += "productId=$ProductId" }
        $res = Call GET ("/orders?" + ($q -join '&'))
        $list = if ($res -is [array]) { $res } elseif ($res.data) { $res.data } else { $res }
        # Asil merak ettigimiz alanlar: status, paymentStatus ve urun eslesmesi
        $list | ForEach-Object {
            [pscustomobject]@{
                id = $_.id; status = $_.status; paymentStatus = $_.paymentStatus
                created = $_.dateCreated; total = $_.totals.total
                products = ($_.lineItems | ForEach-Object { "$($_.productId) $($_.title)$($_.name)" }) -join ' | '
            }
        } | Format-Table -AutoSize
    }
    'order'          { Call GET "/orders/$Id" | ConvertTo-Json -Depth 8 }
    'product'        { Call GET "/products/$Id" | ConvertTo-Json -Depth 6 }
    'webhooks'       { Call GET '/webhooks' | ConvertTo-Json -Depth 6 }
    'webhook-create' {
        # Govde sekli SDK'dan tahmin; hata verirse yanittaki mesaja gore duzeltilecek.
        Call POST '/webhooks' @{ url = $Url; events = $Events } | ConvertTo-Json -Depth 6
        Write-Host "`nYanittaki secret/imza anahtarini KAYDET (webhook imzasini dogrulamak icin lazim)." -ForegroundColor Yellow
    }
    'webhook-delete' { Call DELETE "/webhooks/$Id" }
}
