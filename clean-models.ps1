# clean-models.ps1
# Script xóa thư mục frontend/public/models khỏi Git hoàn toàn và thêm vào .gitignore

# 1. Kiểm tra có git-filter-repo chưa
if (-not (Get-Command "git-filter-repo" -ErrorAction SilentlyContinue)) {
    Write-Host "Vui lòng cài git-filter-repo trước bằng: pip install git-filter-repo"
    exit 1
}

# 2. Dừng nếu chưa commit thay đổi
if ((git status --porcelain).Length -gt 0) {
    Write-Host "Bạn có thay đổi chưa commit. Vui lòng commit hoặc stash lại trước khi chạy."
    exit 1
}

# 3. Chạy git-filter-repo để xóa hoàn toàn thư mục models
git filter-repo --path frontend/public/models --invert-paths

# 4. Thêm dòng vào .gitignore nếu chưa có
$ignoreFile = "frontend/.gitignore"
$ignoreLine = "public/models/"
if (-not (Test-Path $ignoreFile)) {
    New-Item -Path $ignoreFile -ItemType File -Force | Out-Null
}
if (-not (Select-String -Path $ignoreFile -Pattern $ignoreLine -Quiet)) {
    Add-Content -Path $ignoreFile -Value $ignoreLine
}

# 5. Commit lại
git add .
git commit -m "Cleaned history and ignore models folder"

Write-Host "Hoan tat! Git da sach se va da ignore thu muc models!"
