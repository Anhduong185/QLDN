# Script chạy SQL cập nhật database (phiên bản sửa lỗi)
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

$mysqlCommand += " $database"

Write-Host "Chạy lệnh: $mysqlCommand" -ForegroundColor Yellow

# Đọc nội dung file SQL
$sqlContent = Get-Content "update_database.sql" -Raw

# Chạy lệnh
try {
    $sqlContent | & $mysqlPath -h $mysqlHost -u $user $database
    Write-Host "Cập nhật database thành công!" -ForegroundColor Green
} catch {
    Write-Host "Lỗi khi cập nhật database: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Hoàn thành!" -ForegroundColor Green 