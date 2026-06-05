# Interactive GitHub Upload Script using REST API (no Git required)

$owner = "Josephine0408"
$repo = "learningsheet"
$branch = "main"
$files = @("index.html", "style.css", "app.js", "data.js")

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " 學習策略互動學習單 GitHub 上傳小助手" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "本電腦未安裝 Git，將使用 GitHub REST API 直接上傳。" -ForegroundColor Green
Write-Host ""

# Prompt for Token securely
$tokenInput = Read-Host "請輸入您的 GitHub 個人存取代幣 (Personal Access Token, PAT) "
if (-not $tokenInput) {
    Write-Host "錯誤：未輸入代幣，上傳已取消。" -ForegroundColor Red
    Exit
}

$token = $tokenInput.Trim()

$headers = @{
    "Accept" = "application/vnd.github+json"
    "Authorization" = "Bearer $token"
    "X-GitHub-Api-Version" = "2022-11-28"
}

# Upload files
foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    if (-not (Test-Path $filePath)) {
        Write-Host "找不到檔案: $file，跳過。" -ForegroundColor Yellow
        continue
    }

    Write-Host "正在讀取並編碼 $file..." -ForegroundColor Yellow
    
    # Read bytes and convert to base64
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $base64 = [System.Convert]::ToBase64String($bytes)
    
    $uri = "https://api.github.com/repos/$owner/$repo/contents/$file"
    
    # Prepare body
    $body = @{
        message = "Add $file via interactive assistant"
        content = $base64
        branch  = $branch
    } | ConvertTo-Json
    
    Write-Host "正在上傳 $file 到 GitHub..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri $uri -Method Put -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "成功上傳 $file！" -ForegroundColor Green
    } catch {
        Write-Host "上傳 $file 失敗：" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "所有上傳流程已執行完畢！" -ForegroundColor Cyan
Read-Host "按 Enter 鍵結束"
