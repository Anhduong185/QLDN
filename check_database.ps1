# Script kiểm tra database sau khi cập nhật
Write-Host "Kiểm tra cấu trúc database..." -ForegroundColor Green

# Đọc nội dung file SQL kiểm tra
$sqlContent = Get-Content "check_database_update.sql" -Raw

# Chạy lệnh kiểm tra
try {
    $sqlContent | mysql -h localhost -u root qldn_nhansu
    Write-Host "Kiểm tra hoàn thành!" -ForegroundColor Green
} catch {
    Write-Host "Lỗi khi kiểm tra database: $($_.Exception.Message)" -ForegroundColor Red
} 