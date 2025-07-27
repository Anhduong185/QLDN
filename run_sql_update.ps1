# Script chạy SQL cập nhật database
Write-Host "Bắt đầu cập nhật database từ file SQL..." -ForegroundColor Green

# Đường dẫn đến MySQL (thay đổi theo cài đặt của bạn)
$mysqlPath = "mysql"
$mysqlHost = "localhost"
$user = "root"
$password = ""
$database = "qldn_nhansu"

# Tạo lệnh MySQL
$mysqlCommand = "$mysqlPath -h $mysqlHost -u $user"

# Thêm password nếu có
if ($password) {
    $mysqlCommand += " -p$password"
}

$mysqlCommand += " $database < update_database.sql"

Write-Host "Chạy lệnh: $mysqlCommand" -ForegroundColor Yellow

# Chạy lệnh
try {
    Invoke-Expression $mysqlCommand
    Write-Host "Cập nhật database thành công!" -ForegroundColor Green
} catch {
    Write-Host "Lỗi khi cập nhật database: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Hoàn thành!" -ForegroundColor Green 