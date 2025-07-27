# Script cập nhật database
Write-Host "Bắt đầu cập nhật database..." -ForegroundColor Green

# Di chuyển vào thư mục backend
Set-Location "backend"

# Chạy migration
Write-Host "Chạy migration..." -ForegroundColor Yellow
php artisan migrate

# Kiểm tra trạng thái migration
Write-Host "Kiểm tra trạng thái migration..." -ForegroundColor Yellow
php artisan migrate:status

Write-Host "Hoàn thành cập nhật database!" -ForegroundColor Green 